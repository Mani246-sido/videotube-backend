import mongoose , { Schema } from 'mongoose';
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';


const userSchema = new Schema(
    {
        username: { type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            },
        email: { type: String,
            required: true,
            unique: true,
        },
        fullname: 
        {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: { type: String,//cloudinary url
            required: true,
         },
        coverImage: { type: String//cloudinary url

        },
        watchHistory:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',

        }],
        password: { type: String,
            required: [true,"Password is required"],

        },
        refrehToken: { type: String,
        }, 
    }, 
        { timestamps: true}

)
//now we will use prehook to hash password before saving to database
//never use arrow function here because we need to use 'this' keyword
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);


    next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
//we will use jwt for access token and refresh token to manage user sessions
userSchema.methods.generateAccessToken = function () {
    //short lived access token
    return jwt.sign(
        { _id: this._id ,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
 },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY}
    );
};
userSchema.methods.generateRefreshToken = function () {
    //long lived refresh token
    return jwt.sign(
        { _id: this._id ,
    },

        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );
}

    


export const User = mongoose.model('User', userSchema);


