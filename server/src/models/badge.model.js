import mongoose, { Schema } from "mongoose";

const badgeSchema = new Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        icon: {
            type: String,
            trim: true,
            default: "military_tech",
        },
        category: {
            type: String,
            trim: true,
            default: "general",
            index: true,
        },
        rarity: {
            type: String,
            enum: ["common", "rare", "epic", "legendary"],
            default: "common",
        },
        criteria: {
            type: Schema.Types.Mixed,
            default: {},
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        campusScope: {
            type: String,
            enum: ["global", "campus"],
            default: "global",
        },
        manualOnly: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Badge = mongoose.model("Badge", badgeSchema);
