import {Router} from "express";
import {addTeamNum } from "./TeamNumber/store.js"
import {createSuggest} from "./Suggestions/suggest.js"
import {createAdvice} from "./AI/generate.js"
import { register } from "./System/Sign.js";
import { login } from "./System/Login.js";
const router = Router()
router.post("/alert", addTeamNum)
router.post("/suggest", createSuggest)
router.post("/create", createAdvice)
router.post("/register", register)
router.post("/login", createAdvice)

export default router