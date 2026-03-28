import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users.routes.js"
import { errorhandler } from "./middlewares/error.middlewares.js";

const app = express();
//alwayys use cookie parser after express json app thing 

app.use(cookieParser());



app.use(cors(
    {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,

    }
));
//common middlewares
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use( express.static("public"));
//routes
app.use("/api/v1/users", userRoutes);





app.use(errorhandler);
export {app};
//multer for file upload and handling
