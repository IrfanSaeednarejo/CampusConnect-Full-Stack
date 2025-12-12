import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Society } from "../models/society.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";






const createSociety = asyncHandler(async (req, res) => {
   const {name,description,tag} = req.body;
   const nameTrimmed = name?.trim();
   const tagTrimmed = tag?.trim().toLowerCase();

if (!nameTrimmed || !tagTrimmed) {
    throw new ApiError(400, "Name and Tag cannot be empty.");
}

if (tagTrimmed.length < 3) {
    throw new ApiError(400, "Tag must have at least 3 characters.");
}

if(!nameTrimmed || !tagTrimmed){
    throw new ApiError(400,"Name and Tag are required to create a society");
}

   const existingSociety = await Society.findOne({
    $or: [{ tag: tagTrimmed }, { name: nameTrimmed }]
});

   if(existingSociety){
    throw new ApiError(409,"Society with this tag and name already exists");
   }

   if (!req.user?.roles.includes('society_head') || !req.user?.isVerifiedSocietyHead) {
       throw new ApiError(403, "You must be a verified Society Head to create a society.");
   }



   const society = await Society.create({
       name: nameTrimmed,
       description: description?.trim(),
       tag: tagTrimmed,
       createdBy: req.user?._id,
   });
   const createdSociety = await Society.findById(society._id);
   if (!createdSociety) {
       throw new ApiError(404, "Society not found");
   }

   return res
       .status(201)
       .json(
           new ApiResponse(201, createdSociety, "Society created successfully")
       );
});


const addMemberToSociety = asyncHandler(async (req, res) => {
    const isSocietyHead = req.user?.roles?.includes('society_head');
    const isVerified = req.user?.isVerifiedSocietyHead;

    if (!isSocietyHead || !isVerified) {
        throw new ApiError(403, "You must be a verified Society Head to add members to a society.");
    }

    const { id: societyId } = req.params;
    const { memberId, role } = req.body;
    
  
    if (!societyId || !memberId) {
        throw new ApiError(400, "Society ID and member ID are required.");
    }

    const validRoles = ['student', 'active-member', 'co-coordinator', 'executive'];
    const assignedRole = validRoles.includes(role) ? role : 'student';

    
    const society = await Society.findById(societyId);
    if (!society) {
        throw new ApiError(404, "Society not found");
    }

    
    const user = await User.findById(memberId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

  
    const alreadyMember = society.members.some(
        (member) => member.user.toString() === memberId
    );
    if (alreadyMember) {
        throw new ApiError(409, "User is already a member of this society.");
    }


    const userAlreadyLinked = user.joinedSocieties.some(
        (societyid) => societyid.toString() === societyId
    );
    if (userAlreadyLinked) {
        throw new ApiError(409, "User already linked to the society.");
    }

    
    society.members.push({
        memberId: memberId,
        role: assignedRole,
        status: "approved",
        joinedAt: new Date()
    });

    user.joinedSocieties.push(societyId);

    await Promise.all([
        society.save(),
        user.save()
    ]);

    const newMemberSociety = await Society.findById(societyId)

    return res
        .status(201)
        .json(new ApiResponse(201, newMemberSociety, "Member added successfully"));
});


const removeMemberFromSociety = asyncHandler(async (req, res) => {
    const { id: societyId , memberId} = req.params;
    
    const society = await Society.findById(societyId);

    if (!society) {
        throw new ApiError(404, "Society not found");
    }


    const isOwner = society.createdBy.toString() === req.user._id.toString();

    if (!isOwner) {
        throw new ApiError(403, "You do not have permission to manage members for this society.");
    }


    const isMemberPresent = society.members.some(
        (member) => member.memberId.toString() === memberId
    );

    if (!isMemberPresent) {
        throw new ApiError(404, "User is not a member of this society");
    }


    const [removedMemberSociety] = await Promise.all([
        Society.findByIdAndUpdate(
            societyId,
            { 
                $pull: { members: { memberId: memberId } } 
            },
            { new: true } 
        ),

        User.findByIdAndUpdate(
            memberId,
            {
                $pull: { joinedSocieties: societyId }
            }
        )
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, removedMemberSociety, "Member removed successfully"));
});

const updateSociety = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;
    const { name, description, tag } = req.body;

    const society = await Society.findById(societyId);
    if (!society) {
        throw new ApiError(404, "Society not found");
    }

    if (society.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this society");
    }

    const updatedSociety = await Society.findByIdAndUpdate(
        societyId,
        { $set: {
             name: name || society.name,
             description: description || society.description,
             tag: tag || society.tag,

        } },
        { new: true, runValidators: true }
    );

    if (!updatedSociety) {
         throw new ApiError(500, "Failed to update society unexpectedly.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSociety, "Society updated successfully"));
});

const deleteSociety = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;

    const society = await Society.findById(societyId).select('createdBy'); 
    
    if (!society) {
        throw new ApiError(404, "Society not found");
    }

    if (society.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this society");
    }

 
    const deletedSociety = await Society.findByIdAndDelete(societyId);

    const cleanupResult = await User.updateMany(
        { joinedSocieties: societyId },
        { $pull: { joinedSocieties: societyId } } 
    );

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            { societyId: deletedSociety._id, usersCleaned: cleanupResult.modifiedCount }, 
            "Society and all related user links deleted successfully"
        ));
});

const getSocietyMembers = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;

    if (!mongoose.isValidObjectId(societyId)) {
        throw new ApiError(400, "Invalid Society ID");
    }

    const society = await Society.findById(societyId)
        .select("members name")
        .populate({
            path: "members.memberId",
            select: "name email avatar",
            model: "User"
        });

    if (!society) {
        throw new ApiError(404, "Society not found");
    }

    let membersList = society.members;

    return res
        .status(200)
        .json(new ApiResponse(200, membersList, "Society members fetched successfully"));
});


const getSocieties = asyncHandler(async (req, res) => {

    const page = 1;
    const limit = 10;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const societies = await Society.find()
        .populate("createdBy", "name email")
        .select("-members")
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 })
        .exec();

    const total = await Society.countDocuments();

    return res
        .status(200)
        .json(new ApiResponse(200, {
            societies,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / limitNumber)
            }
        }, "Societies fetched successfully"));
});


const getSocietyById = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;

    if (!mongoose.isValidObjectId(societyId)) {
        throw new ApiError(400, "Invalid Society ID format");
    }

    
    const society = await Society.findById(societyId)
        .populate("createdBy", "name email")
        .populate({
            path: "members.memberId",
            select: "name email avatar",
            options: { limit: 5 } 
        });

    if (!society) {
        throw new ApiError(404, "Society not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, society, "Society fetched successfully"));
});


export {
    getSocieties,
    getSocietyById,
    createSociety,
    addMemberToSociety,
    removeMemberFromSociety,
    updateSociety,
    deleteSociety,
    getSocietyMembers,
};  
