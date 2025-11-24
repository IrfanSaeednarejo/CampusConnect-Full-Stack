
import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const userSchema = new Schema( {
		
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        validate: {
            validator: function(v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid education email!`
        }

    },

    emailVerified: { 
        type: Boolean, 
        default: false 
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }, 
    roles: [
    { 
        type: String,
        enum: ['student','mentor','society_head','admin'], 
        default: ['student']
     }
    ],

    campusId:
     { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campus' 
    },

    profile: {

    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        lowercase: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        lowercase: true,
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        unique: true,
        lowercase: true,
        index: true,
        

    },
    avatar: {
        type: String, //cloudinary url
    },
    coverImage: {
        type: String, //cloudinary url
    },
    bio: {
        type:String,
        maxlength: 300,
        default: "",
        trim: true,
    },

    phone: {
        type: String,
        default: '',
        trim: true,
        },


    degree: {
        type: String,
        default: '',
        trim: true,
    },

    department: {
        type: String,
        default: '',
        trim: true,
    },

    semester: {
        type: Number,
        default: 0,
        max: 8
    },
    },

    interests: [

        { type : String }
    ],

    socialLinks: [
    { 
        provider: { type: String },
        url: { type: String}
    }
    ],


    onboarding: {
    completedSteps: [String],
    roleSelected: String,
    createdAt: { type: Date, default: Date.now }
  },

    verification: {
    isVerifiedMentor: { type: Boolean,
    default: false 
  }},
    
    status: { type: String, enum: ['active','suspended','deleted'], default: 'active' },

    refreshToken: {
        type: String
    }
  },
  { timestamps: true });

userSchema.index({ campusId: 1, roles: 1 });




userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}


export const User = mongoose.model("User", userSchema);