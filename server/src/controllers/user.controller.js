import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../config/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";

const generateAccessandRefreshTokens = async (userId, val = 0) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        if (val === 0) {
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });
            return { accessToken, refreshToken };
        }
        return { accessToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};

function unlinkPath(...paths) {
    paths.forEach(p => {
        if (p && fs.existsSync(p)) fs.unlinkSync(p);
    });
}

const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, displayName, email, password } = req.body;

    // Ensure all required fields are provided
    if (![firstName, lastName, displayName, email, password].every(f => f && f.trim() !== "")) {
        throw new ApiError(400, "All fields are required");
    }

    console.log("req.files:", req.files);

   
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath || !fs.existsSync(avatarLocalPath)) {
        throw new ApiError(400, "Avatar file is required");
    }

   
    const displayNameLower = displayName.toLowerCase();
    const existedUser = await User.findOne({
        $or: [{ "profile.displayName": displayNameLower }, { email }],
    });

    if (existedUser) {
        unlinkPath(avatarLocalPath, coverImageLocalPath);
        throw new ApiError(409, "User with display name or email already exists");
    }
    // Upload files to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar || !avatar.secure_url) {
        unlinkPath(avatarLocalPath, coverImageLocalPath);
        throw new ApiError(400, "Avatar upload failed");
    }

    const user = await User.create({
        email,
        password,
        profile: {
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            displayName: displayNameLower,
            avatar: avatar.secure_url,
            coverImage: coverImage?.secure_url || "",
        },
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});


const loginUser = asyncHandler(async (req, res) => {

    const { email, displayName, password } = req.body;

    if (!displayName && !email) {
        throw new ApiError(400, "displayName or email is required");
    }

    const user = await User.findOne({
        $and: [{ "profile.displayName": displayName.toLowerCase() }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged In Successfully"
            )
        );
});

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        const { accessToken } = await generateAccessandRefreshTokens(
            user._id,
            1
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(200, { accessToken }, "Access token refreshed")
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are required");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match");
    }

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect old password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { firstName, lastName, displayName, email, bio } = req.body?.profile || req.body;

    if (!firstName && !lastName && !displayName && !email && !bio) {
        throw new ApiError(400, "At least one field is required");
    }

    const displayNameLower = displayName?.toLowerCase();

    
    if (displayNameLower && displayNameLower !== req.user.profile.displayName) {
        const isExist = await User.findOne({ "profile.displayName": displayNameLower });
        if (isExist) {
            throw new ApiError(409, "Display name not available");
        }
    }
   if (email && email !== req.user.email) {
        const isEmailExist = await User.findOne({ "profile.email": email });
        if (isEmailExist) {
            throw new ApiError(409, "Email already registered");
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                    "profile.lastName": lastName || req.user.profile.lastName,
                    "profile.displayName": displayNameLower || req.user.profile.displayName,
                    email: email || req.user.profile.email,
                    "profile.bio": bio || req.user.profile.bio,
                    "profile.firstName": firstName || req.user.profile.firstName,
                
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.secure_url) {
        throw new ApiError(400, "Error while uploading the avatar");
    }

    const avatarUrl = req.user?.profile?.avatar; 

    
    if (avatarUrl) {
        const regex = /\/([^/]+)\.[^.]+$/;
        const match = avatarUrl.match(regex);
        if (match) {
            const publicId = match[1];
            deleteFromCloudinary(publicId).catch(err => console.log("Old avatar deletion failed", err)); 
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                "profile.avatar": avatar.secure_url, 
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
});


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.secure_url) {
        throw new ApiError(400, "Error while uploading the cover image");
    }

    const coverImageUrl = req.user?.profile?.coverImage; 

    if (coverImageUrl) {
        const regex = /\/([^/]+)\.[^.]+$/;
        const match = coverImageUrl.match(regex);
        if (match) {
            const publicId = match[1];
            deleteFromCloudinary(publicId).catch(err => console.log("Old cover deletion failed", err));
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                "profile.coverImage": coverImage.secure_url, 
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"));
});


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
};
