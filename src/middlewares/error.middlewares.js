import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

//global error handler middleware
const errorhandler = (err, req, res, next) => {
    let error = err;
    //console.log(err);
    if(!(error instanceof ApiError)){
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message,error?.errors || [],error.stack);
    }
    const response = {
        ...error,
        message: error.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" ? {stack: error.stack}: {})
    };
    return res.status(error.statusCode).json(response);
}

export { errorhandler };
//ye hrr jgh chlega standard error handler
