import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";


const socialLinkSchema = new Schema(
    {
        provider: {
            type: String,
            enum: ["github", "linkedin", "twitter", "instagram", "portfolio", "other"],
            required: true,
        },
        url: {
            type: String,
            trim: true,
            validate: {
                validator: (v) => /^https?:\/\/.+/.test(v),
                message: "Social link must be a valid URL",
            },
        },
    },
    { _id: false }
);

const profileSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            lowercase: true,
            maxlength: [50, "First name cannot exceed 50 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            lowercase: true,
            maxlength: [50, "Last name cannot exceed 50 characters"],
        },
        displayName: {
            type: String,
            required: [true, "Display name is required"],
            trim: true,
            lowercase: true,
            maxlength: [30, "Display name cannot exceed 30 characters"],
        },
        avatar: {
            type: String,
            default: "",
        },
        avatarPublicId: {
            type: String,
            default: "",
            select: false,
        },
        coverImage: {
            type: String,
            default: "",
        },
        coverImagePublicId: {
            type: String,
            default: "",
            select: false,
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [300, "Bio cannot exceed 300 characters"],
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
            validate: {
                validator: (v) => !v || /^\+?[\d\s\-()]{7,15}$/.test(v),
                message: "Phone number format is invalid",
            },
        },
    },
    { _id: false }
);

const academicSchema = new Schema(
    {
        degree: { type: String, trim: true, default: "" },
        department: { type: String, trim: true, default: "" },
        semester: { type: Number, default: 0, min: 0, max: 12 },
        enrollmentYear: { type: Number, min: 2000, max: 2100 },
        expectedGraduation: { type: Number, min: 2000, max: 2100 },
        cgpa: { type: Number, min: 0, max: 4.0 },
        gpaScale: { type: Number, enum: [4.0, 5.0, 10.0], default: 4.0 },
        studentId: { type: String, trim: true, default: "" },
    },
    { _id: false }
);

const onboardingSchema = new Schema(
    {
        isComplete: { type: Boolean, default: false },
        completedSteps: { type: [String], default: [] },
        roleSelected: { type: String, default: "" },
        completedAt: { type: Date },
    },
    { _id: false }
);

const verificationSchema = new Schema(
    {
        isVerified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
        rejectedAt: { type: Date },
        rejectedReason: { type: String, trim: true },
    },
    { _id: false }
);

const preferencesSchema = new Schema(
    {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true },
            digest: { type: Boolean, default: false },
        },
        privacy: {
            showEmail: { type: Boolean, default: false },
            showPhone: { type: Boolean, default: false },
            showOnlineStatus: { type: Boolean, default: true },
            profileVisibility: {
                type: String,
                enum: ["public", "campus", "connections"],
                default: "campus",
            },
        },
        theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
        language: { type: String, default: "en" },
    },
    { _id: false }
);


const userSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v) =>
                    /^[\w.+-]+@[\w-]+\.[\w.]{2,}$/.test(v),
                message: (p) => `${p.value} is not a valid email`,
            },
        },

        emailVerified: { type: Boolean, default: false, index: true },

        emailVerificationToken: { type: String, select: false },
        emailVerificationExpiry: { type: Date, select: false },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },

        passwordResetToken: { type: String, select: false },
        passwordResetExpiry: { type: Date, select: false },
        roles: {
            type: [String],
            enum: {
                values: ["student", "mentor", "society_head", "admin"],
                message: "{VALUE} is not a valid role",
            },
            default: ["student"],
            validate: {
                validator: (arr) => arr.length <= 4 && new Set(arr).size === arr.length,
                message: "Roles must be unique and max 4 entries",
            },
        },

        mentorVerification: { type: verificationSchema, default: () => ({}) },
        societyHeadVerification: { type: verificationSchema, default: () => ({}) },

        profile: { type: profileSchema, default: () => ({}) },
        academic: { type: academicSchema, default: () => ({}) },

        interests: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 20,
                message: "Max 20 interests allowed",
            },
            set: (arr) => [...new Set(arr.map((i) => i.trim().toLowerCase()))],
        },

        socialLinks: {
            type: [socialLinkSchema],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 10,
                message: "Max 10 social links allowed",
            },
        },

        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            index: true,
        },

        mentorProfile: {
            type: Schema.Types.ObjectId,
            ref: "Mentor",
        },
        preferences: { type: preferencesSchema, default: () => ({}) },

        onboarding: { type: onboardingSchema, default: () => ({}) },

        status: {
            type: String,
            enum: ["active", "suspended", "deactivated", "deleted"],
            default: "active",
            index: true,
        },

        suspendedAt: { type: Date },
        suspendedBy: { type: Schema.Types.ObjectId, ref: "User" },
        suspendReason: { type: String, trim: true },

        deletedAt: { type: Date },
        refreshToken: { type: String, select: false },
        tokenVersion: { type: Number, default: 0, select: false },
        lastLoginAt: { type: Date },
        lastLoginIp: { type: String, select: false },
        loginCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


userSchema.index({ campusId: 1, roles: 1 });

userSchema.index({ campusId: 1, "profile.displayName": 1 });
userSchema.index({ status: 1, campusId: 1 });
userSchema.index(
    { createdAt: -1 },
    { partialFilterExpression: { status: "active" } }
);
userSchema.index(
    { emailVerificationExpiry: 1 },
    { expireAfterSeconds: 0, sparse: true }
);

userSchema.index(
    { passwordResetExpiry: 1 },
    { expireAfterSeconds: 0, sparse: true }
);
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("refreshToken") || !this.refreshToken) return next();
    this.refreshToken = crypto
        .createHash("sha256")
        .update(this.refreshToken)
        .digest("hex");
    next();
});

userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            displayName: this.profile.displayName,
            roles: this.roles,
            tokenVersion: this.tokenVersion,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id, tokenVersion: this.tokenVersion },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );
};

userSchema.methods.generateEmailVerificationToken = function () {
    const rawToken = crypto.randomBytes(32).toString("hex");
    this.emailVerificationToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    this.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    return rawToken;
};

userSchema.methods.generatePasswordResetToken = function () {
    const rawToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
    return rawToken;
};

userSchema.methods.incrementTokenVersion = async function () {
    this.tokenVersion += 1;
    await this.save({ validateBeforeSave: false });
};

userSchema.statics.findByVerificationToken = function (rawToken) {
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    return this.findOne({
        emailVerificationToken: hashed,
        emailVerificationExpiry: { $gt: Date.now() },
    });
};

userSchema.statics.findByPasswordResetToken = function (rawToken) {
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    return this.findOne({
        passwordResetToken: hashed,
        passwordResetExpiry: { $gt: Date.now() },
    });
};

userSchema.virtual("profile.fullName").get(function () {
    const { firstName = "", lastName = "" } = this.profile || {};
    return `${firstName} ${lastName}`.trim();
});

userSchema.virtual("isVerifiedMentor").get(function () {
    return this.mentorVerification?.isVerified ?? false;
});

userSchema.virtual("isVerifiedSocietyHead").get(function () {
    return this.societyHeadVerification?.isVerified ?? false;
});

export const User = mongoose.model("User", userSchema);