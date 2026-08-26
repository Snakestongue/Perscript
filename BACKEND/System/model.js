import mongoose, {Schema } from "mongoose"; 
import validator from "validator"
const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
        minLength: 1,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        // maxLength: 25,
        select: false
    },
    email:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
        validate: {
        validator: validator.isEmail,
        message: props =>`${props.value} is not a valid email!`
        }
    },
},
    {
        timestamps: true
    }
)

export const User = mongoose.model("User", userSchema);