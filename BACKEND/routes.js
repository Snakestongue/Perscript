import {Router} from "express";
import {addTeamNum } from "./TeamNumber/store.js"
import {createSuggest} from "./Suggestions/suggest.js"
import {createAdvice} from "./AI/generate.js"
import { getRating } from "./Rating/returnRating.js";
import { getAuth  } from "@clerk/express";
import { syncUser } from "./System/syncUser.js";
import { getSavedCode, saveCode } from "./System/saveCode.js";
import {getCompletions, completeProblem,} from "./System/complete.js";
const router = Router()
router.post("/alert", addTeamNum)
router.post("/suggest", createSuggest)
router.post("/create", createAdvice)
router.get("/rating", getRating)
router.post("/sync-user", syncUser);
router.get("/completions", getCompletions);
router.post("/completions", completeProblem);
router.get("/saved-code", getSavedCode);
router.post("/saved-code", saveCode);
router.get("/clerk-test", (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated){
    return res.status(401).json({
      error: "Unauthorized"
    });}
  res.json({
    message: "You are authenticated!",
    userId
  });
});

export default router
