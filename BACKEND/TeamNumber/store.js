import {number as NumberModel} from "./schema.js";
let addTeamNum =async(req, res)=>{
  try{
    const {numReq} = req.body;
    if (!numReq){
      return res.status(400).json({message: "Number must be given"});
    }
    const newNumber = await NumberModel.create({
      teamNumber: numReq
    });
    res.status(201).json({
      message: "Team number added.",
      totalNum: {id: newNumber._id},
    });
  }catch (error){
    console.log("ERROR", error);
    res.status(500).json({ message: "Internal server error" +error});
  }
};
export {addTeamNum};