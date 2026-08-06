import mongoose, {Schema} from "mongoose";
const suggestSchema = new Schema({
    suggest:{
        type:String
    },
    rating:{
        type:Number
    },
    category:{
        type:String
    }
},{
    timestamps:true
});
export const suggestion = mongoose.model("Suggestion", suggestSchema);