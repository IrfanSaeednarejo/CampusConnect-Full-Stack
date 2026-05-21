import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isLikelyDataUri = (value) => typeof value === "string" && value.startsWith("data:");

const uploadOnCloudinary = async (source, options = {}) => {
    try {
        if (!source) return null;

        const response = await cloudinary.uploader.upload(source, {
            resource_type: "auto",
            ...options,
        });

        if (!isLikelyDataUri(source) && fs.existsSync(source)) {
            fs.unlinkSync(source);
        }
        return response;

    } catch (error) {
       
        console.error("CLOUDINARY UPLOAD ERROR:", error); 

        if (!isLikelyDataUri(source) && fs.existsSync(source)) {
            fs.unlinkSync(source);
        }
        
        return null;
    }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return response;
    } catch (error) {
        console.error("Error deleting asset from Cloudinary:", error.message);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
