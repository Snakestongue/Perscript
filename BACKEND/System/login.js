import {User} from "./model.js";
import bcrypt from "bcrypt";
const login =  async(req, res) => {
    try{
        const {username, password} = req.body
        if (!username || !password){
            console.log(req.body);
            return res.status(400).json({message: "All fielda must be filled out"})
        }

        const existing = await User
            .findOne({username: username.toLowerCase() })
            .select("+password");
        if (!existing){
                return  res.status(404).json({
                    message: "Username not registered"
                }); 
        }
        const isPasswordMatch = await bcrypt.compare(password, existing.password) 
        if (!isPasswordMatch){
            return res.status(400).json({
                message:"Incorrect password"
            })
        }  
        return res.status(200).json({
            message: "Logging back in!",
            user:{
                id: existing._id,
                user: existing.username
            }
        });    
    }catch (error) {
        console.log("Register error", error)
        res.status(500).json({message:"Internal server error"})
    }
}
export{
    login
}