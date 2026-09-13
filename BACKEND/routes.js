import {Router} from "express";
import {addTeamNum } from "./TeamNumber/store.js"
import {createSuggest} from "./Suggestions/suggest.js"
import {createAdvice} from "./AI/generate.js"
import { getRating } from "./Rating/returnRating.js";
const router = Router()
router.post("/alert", addTeamNum)
router.post("/suggest", createSuggest)
router.post("/create", createAdvice)
router.get("/rating", getRating)

export default router