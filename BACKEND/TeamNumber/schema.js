import mongoose, {Schema } from "mongoose"
const teamNumSchema = new Schema({
    teamNumber:{
      type: Number,
      required: true,
      // max: 6
    }
  },{
    timestamps: true 
  });
export const number = mongoose.model("Number:", teamNumSchema);
