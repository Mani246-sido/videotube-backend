import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/apiError"
import { apiResponse } from "../utils/apiResponse.js"
import { asynchandler } from "../utils/asyncHandler"

export const verifyJWT = asynchandler(async(req,_,next)=>{
    //authorization can be saved from header so we can use header for tokens 
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401,"unauthorized")
    }
    try{
        const decodedtoken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedtoken?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401,"unauthorized")
        }
        req.user = user;
        //to transfer the flow control use next
        next();

    }catch(Error){
        throw new ApiError(401,Error?.message || "invalid access token ")

    }
    

})

