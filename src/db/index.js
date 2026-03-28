import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

//connecting to mongodb database
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`{process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`!!!!!!!!!Connected to database successfully!!!!!!!!!!!!! ${connectionInstance.connection.host}`);
        }
    catch (error) {
        console.log("Error connecting to database", error);
        process.exit(1);
    }
    
}
export default connectDB