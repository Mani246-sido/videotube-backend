import generateAccessToken from '../models/user.model.js';
import { User } from '../models/user.model.js';
import asyncHandler, { asynchandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import { uploadCloudinary} from '../utils/cloudinary.js';
import {apiResponse, ApiResponse} from '../utils/apiResponse.js';
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId);
    //small check for user existence
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
    }catch(error){
        throw new ApiError(500,"Error generating tokens");
    }
    
}


const registerUser = asyncHandler(async (req, res) => {
    const { fullname ,username, email, password } = req.body;

    //validate
    if([fullname ,username, email, password ].some((field) => field?.trim() === "")){
        throw new ApiError(400,"All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (existingUser) {
        throw new ApiError(400, "User with this email or username already exists");
    } 

    //image handling
    const avatarlocalpath = req.files?.avatar?.[0]?.path
    const coverImagelocalpath = req.files?.coverImage?.[0]?.path

    if(!avatarlocalpath){
        throw new ApiError(400,"Avatar is required");
    }

    //upload to cloudinary

    let avatar;
    try {
        avatar = await uploadCloudinary(avatarlocalpath);
    } catch (error) {
        throw new ApiError(500,"Error uploading avatar image");
    }
    let coverImage;
    if(coverImagelocalpath){
        try {
            coverImage = await uploadCloudinary(coverImagelocalpath);
        }
            catch (error) {
            throw new ApiError(500,"Error uploading cover image");
        }
    }
    //const avatarUrl = await uploadCloudinary(avatarlocalpath);
    //const coverImageUrl = coverImagelocalpath ? await uploadCloudinary(coverImagelocalpath) : null;
    //create user
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImageUrl?.url || "",
        email,
        username,
        password,
    }); 
    //return user data except password
    const createdUser = await User.findById(user._id).select("-password -refrehToken ");
    if(!createdUser){
        throw new ApiError(500,"User not created, please try again");
    }
   return res.status(201).json(new ApiResponse(201,"User registered successfully", createdUser)
    );
   
    


});
const loginUser = asyncHandler(async (req, res) => {
    //get data from body
    const { email, username ,password } = req.body;
    //validate
    if(!email){
        throw new ApiError(400,"Email is required");
    }
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }
    //generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    //return response
    const loggenInUser = await User.findById(user._id).select("-password -refrehToken ");
    if(!loggenInUser){
        throw new ApiError(500,"Error logging in user, please try again");
    }
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
         // Set to true in production
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200,"User logged in successfully", {
            user: loggenInUser,
            accessToken,
            refreshToken,
        })
    );

});
const logoutUser = asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken: undefined,

            }
        },
        {new:true}
    )
    const options = {
        httpOnly : true,
        secure : process.env.NODE_ENV= "production",
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out successfully"))
})
const refreshAccessToken =asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"refresh token is required")

    
    }
    try {
        const decodedtoken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedtoken?._id)
        if(!user){
            throw new ApiError(401,"invalid refresh token");
        }
        if(user.refreshToken!== user?.refreshToken){
            throw new ApiError(401,"invalid refresh token");

        }
        const options = {
            httpOnly:
             true,
             secure : process.env.NODE_ENV = "production",


        }
        const {accessToken,refreshToken: newrefreshToken} = await generateAccessAndRefreshToken(user._id)

        return res.status(200).cookie("accessToken",accessToken,options)
        .cookie("refresToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refrehToken: newrefreshToken
                },
                "Access Token refersh successfully"
            )
        )

        
        
    } catch (error) {
        throw new ApiError(500, "something went wrong while refreshing access token")

        
    }

})
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword}=req.body
    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(410,"old password is incorrect")

    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200)
    .json(new apiResponse(200,{},"password changed successfully"))



})
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new apiResponse(200,req.user,"current user details "))
    
})
const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email}= req.body;
    //validate 
    if(!fullname || !email){
        throw new ApiError(400,"fullname and email are required") 
    

    }
    const user  =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },{
            new:true
        }
        
    ).select("-password -refreshToken")
    
    return res.status(200).json(new apiResponse(200,user,"account details updated successfully"))
})
const updateUserAvatar = asyncHandler(async(req,res)=>{
   const avatarlocalpath =  req.file?.path
   if(!avatarlocalpath){
    throw new ApiError(400,"file is required")
   }
   const avatar = await uploadCloudinary(avatarlocalpath)
   if(!avatar.url){
    throw new ApiError(500,"something went wrong while uploading avatar")
   }
   const user = await User.findByIdAndUpdate(
    req.user?._id,{
$set:{
    avatar :avatar.url
}
    },
    {new:true}
   ).select("-password -refreshToken")
   return res.status(200).json(new apiResponse(200,user,"account avatar  updated successfully"))
})
const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const usercoverimagelocalpath =  req.file?.path
   if(!usercoverimagelocalpath){
    throw new ApiError(400,"file is required")
   }
   const avatar = await uploadCloudinary(usercoverimagelocalpath)
   if(!coverImage.url){
    throw new ApiError(500,"something went wrong while uploading avatar")
   }
   const user = await User.findByIdAndUpdate(
    req.user?._id,{
$set:{
    coverImage :coverImage.url
}
    },
    {new:true}
   ).select("-password -refreshToken")
   return res.status(200).json(new apiResponse(200,user,"account usercoverimage updated successfully"))
})
export { registerUser, loginUser, generateAccessAndRefreshToken , 
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    changeCurrentPassword,
    

};

