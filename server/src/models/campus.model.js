import mongoose, { Schema } from "mongoose";

const locationSchema = new Schema(
  {
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City name cannot exceed 100 characters"],
    },
    province: {
      type: String,
      trim: true,
      maxlength: [100, "Province cannot exceed 100 characters"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [100, "Country name cannot exceed 100 characters"],
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, "Postal code cannot exceed 20 characters"],
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (v) =>
            !v || !v.length ||
            (v.length === 2 &&
              v[0] >= -180 && v[0] <= 180 &&
              v[1] >= -90 && v[1] <= 90),
          message: "Coordinates must be [longitude, latitude] within valid ranges",
        },
      },
    },
  },
  { _id: false }
);

const contactSchema = new Schema(
  {
    website: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "Website must be a valid URL starting with http:// or https://",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => !v || /^[\w.+-]+@[\w-]+\.[\w.]{2,}$/.test(v),
        message: "Contact email is not valid",
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^\+?[\d\s\-()]{7,20}$/.test(v),
        message: "Phone number format is invalid",
      },
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


export const CAMPUS_FACILITIES = [
  "library",
  "gym",
  "hostel",
  "cafeteria",
  "auditorium",
  "sports-complex",
  "medical-center",
  "parking",
  "computer-labs",
  "mosque",
  "bank",
  "transport",
  "daycare",
  "swimming-pool",
];


const campusSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Campus name is required"],
      trim: true,
      maxlength: [150, "Campus name cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, "Campus code cannot exceed 20 characters"],
      sparse: true,
    },

    type: {
      type: String,
      enum: {
        values: ["main", "satellite", "online"],
        message: "{VALUE} is not a valid campus type",
      },
      default: "main",
    },

    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "archived"],
        message: "{VALUE} is not a valid campus status",
      },
      default: "active",
    },

    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    established: {
      type: Number,
      min: [1800, "Established year seems too early"],
      max: [new Date().getFullYear(), "Established year cannot be in the future"],
      validate: {
        validator: Number.isInteger,
        message: "Established must be a 4-digit year",
      },
    },

    location: {
      type: locationSchema,
      required: [true, "Campus location is required"],
    },

    timezone: {
      type: String,
      default: "Asia/Karachi",
      trim: true,
      validate: {
        validator: (v) => {
          try {
            Intl.DateTimeFormat(undefined, { timeZone: v });
            return true;
          } catch {
            return false;
          }
        },
        message: (p) => `"${p.value}" is not a valid IANA timezone`,
      },
    },

    contact: {
      type: contactSchema,
      default: () => ({}),
    },

    media: {
      type: mediaSchema,
      default: () => ({}),
    },

    facilities: {
      type: [String],
      enum: {
        values: CAMPUS_FACILITIES,
        message: "{VALUE} is not a recognised facility tag",
      },
      default: [],
      set: (arr) => [...new Set(arr)],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


campusSchema.index({ slug: 1 }, { unique: true });
campusSchema.index({ code: 1 }, { unique: true, sparse: true });

campusSchema.index({ status: 1, "location.country": 1 });

campusSchema.index({ "location.city": 1 });

campusSchema.index({ adminId: 1 }, { sparse: true });

// Optional: 2dsphere index for $near queries (uncomment when map feature is built)
// campusSchema.index({ "location.coordinates": "2dsphere" });

campusSchema.pre("save", async function (next) {
  if (!this.isNew && !this.isModified("name")) return next();
  if (!this.isNew && this.slug) return next();

  const base = slugify(this.name);
  let candidate = base;
  let counter = 1;

  while (
    await mongoose.model("Campus").exists({
      slug: candidate,
      _id: { $ne: this._id },
    })
  ) {
    candidate = `${base}-${counter++}`;
  }

  this.slug = candidate;
  next();
});


campusSchema.virtual("logoUrl").get(function () {
  return this.media?.logo || "";
});

campusSchema.virtual("coverImageUrl").get(function () {
  return this.media?.coverImage || "";
});

campusSchema.virtual("fullLocation").get(function () {
  const { city, province, country } = this.location || {};
  return [city, province, country].filter(Boolean).join(", ");
});


campusSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug: slug.toLowerCase().trim() });
};

campusSchema.statics.findActive = function (country) {
  const filter = { status: "active" };
  if (country) filter["location.country"] = country;
  return this.find(filter).select("-media.logoPublicId -media.coverImagePublicId");
};


export const Campus = mongoose.model("Campus", campusSchema);