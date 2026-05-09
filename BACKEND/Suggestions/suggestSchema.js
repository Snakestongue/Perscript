import mongoose, {Schema} from "mongoose";
const suggestSchema = new Schema({
    suggest:{
        type:String
    }
},{
    timestamps:true
});
export const suggestion = mongoose.model("Suggestion", suggestSchema);