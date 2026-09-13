import mongoose from "mongoose";
export const getRating = async (req, res) => {
    try {
        const result =await mongoose.connection.db.collection("suggestions").aggregate([{
            $group:{
                _id: null,
                averageRating: { $avg: "$rating" }
            }
        }]).toArray()
        res.json({average: result[0]?.averageRating ?? 0})
    } catch (error) {
        console.error("error :(", error);
        res.status(500).json({ error: "Failed to get rating!" });
    }
};