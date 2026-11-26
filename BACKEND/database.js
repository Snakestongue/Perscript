// import mongoose from "mongoose"
// const connectDB = async() =>{
//     try{
//         const connectInstance =await mongoose.connect
//         (`${process.env.mongodbURI}`)
//         console.log(`\n MongoDB has connected.
//             ${connectInstance.connection.host}`)
//     }catch(error){
//         console.log("Connection fail", error)
//         process.exit(1)
//     }
// }
// export default connectDB;


import { prisma } from "./prisma.js";

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("PostgreSQL connected successfully!");
    } catch (error) {
        console.error("PostgreSQL connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;
