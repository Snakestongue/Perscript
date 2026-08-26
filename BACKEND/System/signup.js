import {User} from "./model.js";
import bcrypt from "bcrypt";
const register =  async(req, res) => {
    try {
        const {username, email, password, checkbox} = req.body
        if (!username || !email ||  !password || checkbox==false){
            return res.status(400).json({message: "All field must be filled out"});
        }

        const existingEmail = await User.findOne({
            email: email.toLowerCase()
        });
        if (existingEmail) {
            return res.status(400).json({
                message: "Email already registered. Try another email or login!"
            });
        }
        const existingUserName = await User.findOne({ 
            username: username.toLowerCase() 
        });
        if (existingUserName){
            return res.status(400).json({
                message: "Username already registered. Try another username or login!"
            });
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            loggedIn: false
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {id: user._id, email: user.email, user: user.username}
        })
    }catch (error) {
        console.log("Register error", error)
        res.status(500).json({message:"Internal server error"})//, error: error.message})
    }
}
export{register}