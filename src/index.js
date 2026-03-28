import {app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});


const PORT =  process.env.PORT || 3000;


//starting the server after database connection
connectDB()
.then(
    ()=>{
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
        });
    }
)
.catch((err)=>{
    console.log("Error connecting to database", err);
    process.exit(1);
});