import { prisma } from "../prisma.js";
let addTeamNum = async (req, res) => {
  try {
    const { numReq } = req.body;
    if (!numReq) {
      return res.status(400).json({ message: "Number must be given" });
    }
    console.log("TEST 1:", numReq);
    const newNumber = await prisma.teamNumber.create({
      data: {teamNumber: Number(numReq)}

    });
    console.log("Test 2:", numReq);
    res.status(201).json({
      message: "Team number added.",
      totalNum: { id: newNumber.id },
    });
    console.log("Test 3:", numReq);
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json({ message: "Internal server error" + error });
  }
};
export { addTeamNum };