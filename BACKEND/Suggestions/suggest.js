import {suggestion as SuggestModel} from "./suggestSchema.js";
let createSuggest =async(req, res)=>{
  try{
    const {suggestReq, rating, category} = req.body
    if(!suggestReq || !rating || !category){
      return res.status(400).json({message: "All fields must be filled out!"});
    }
    const newSuggest =await SuggestModel.create({
      suggest: suggestReq,
      category: category,
      rating: rating
    });
    res.status(201).json({
      message: "Thanks you so much!",
      IDSuggest: {id: newSuggest._id}
    })
  }catch (error){
    console.log("ERROR", error);
    res.status(500).json({message:"Internal server error" +error.message})
  }
}
export {createSuggest}