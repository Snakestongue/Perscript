import mongoose from "mongoose"
const connectDB = async() =>{
    try{
        const connectInstance =await mongoose.connect
        (`${process.env.mongodbURI}`)
        console.log(`\n MongoDB has connected.
            ${connectInstance.connection.host}`)
    }catch(error){
        console.log("Connection fail", error)
        process.exit(1)
    }
}
export default connectDB;