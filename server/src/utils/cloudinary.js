import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folder = "campusconnect") => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder,
        });
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkErr) {
            console.error(`[Cloudinary] Failed to delete local file ${localFilePath}`, unlinkErr.message);
        }

        return response;
    } catch (error) {
        try {
            if (localFilePath) fs.unlinkSync(localFilePath);
        } catch (unlinkErr) {
            console.error(`[Cloudinary] Failed to delete local file ${localFilePath}`, unlinkErr.message);
        }
        return null;
    }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null;
        return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error("[Cloudinary] Failed to delete file", error.message);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
