import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema(
    {
        memberId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["student", "active-member", "co-coordinator", "executive"],
            default: "student",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "left"],
            default: "approved",
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const mediaSchema = new Schema(
    {
        logo: { type: String, default: "" },
        logoPublicId: { type: String, default: "", select: false },
        coverImage: { type: String, default: "" },
        coverImagePublicId: { type: String, default: "", select: false },
    },
    { _id: false }
);


const slugify = (str) =>
    str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");


export const SOCIETY_CATEGORIES = [
    "academic",
    "cultural",
    "sports",
    "tech",
    "social",
    "arts",
    "professional",
    "religious",
    "volunteer",
    "other",
];


const societySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Society name is required"],
            trim: true,
            maxlength: [100, "Society name cannot exceed 100 characters"],
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
            default: "",
        },

        category: {
            type: String,
            enum: {
                values: SOCIETY_CATEGORIES,
                message: "{VALUE} is not a valid category",
            },
            default: "other",
        },

        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: [true, "Campus ID is required"],
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator is required"],
        },

        members: {
            type: [memberSchema],
            default: [],
        },

        memberCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        media: {
            type: mediaSchema,
            default: () => ({}),
        },

        tag: {
            type: String,
            required: [true, "Tag is required"],
            trim: true,
            lowercase: true,
            minlength: [3, "Tag must be at least 3 characters"],
            maxlength: [30, "Tag cannot exceed 30 characters"],
        },

        status: {
            type: String,
            enum: {
                values: ["pending", "approved", "rejected", "archived"],
                message: "{VALUE} is not a valid status",
            },
            default: "approved",
        },

        requireApproval: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);


societySchema.index({ slug: 1 }, { unique: true });
societySchema.index({ campusId: 1, category: 1 });
societySchema.index({ campusId: 1, status: 1 });
societySchema.index({ tag: 1 }, { unique: true });
societySchema.index({ "members.memberId": 1 });
societySchema.index(
    { name: "text", tag: "text", description: "text" },
    { weights: { name: 10, tag: 5, description: 1 } }
);


societySchema.pre("save", async function (next) {
    if (!this.isNew && !this.isModified("name")) return next();
    if (!this.isNew && this.slug) return next();

    const base = slugify(this.name);
    let candidate = base;
    let counter = 1;

    while (
        await mongoose.model("Society").exists({
            slug: candidate,
            _id: { $ne: this._id },
        })
    ) {
        candidate = `${base}-${counter++}`;
    }

    this.slug = candidate;
    next();
});


societySchema.pre("save", function (next) {
    if (this.isModified("members")) {
        this.memberCount = this.members.filter(
            (m) => m.status === "approved"
        ).length;
    }
    next();
});


societySchema.virtual("logoUrl").get(function () {
    return this.media?.logo || "";
});

societySchema.virtual("coverImageUrl").get(function () {
    return this.media?.coverImage || "";
});


societySchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug: slug.toLowerCase().trim() });
};

societySchema.statics.findByCampus = function (campusId, status = "approved") {
    const filter = { campusId };
    if (status !== "all") filter.status = status;
    return this.find(filter).select("-media.logoPublicId -media.coverImagePublicId");
};

export const Society = mongoose.model("Society", societySchema);