import cors from "cors"
import express from "express";
import path from "path"
import { fileURLToPath } from "url"
import { dirname} from "path"
import router from "./routes.js"
import dotenv from "dotenv"
import connectDB from "./database.js"
import { prisma } from "./prisma.js";
import { clerkMiddleware } from "@clerk/express";

const __filename =fileURLToPath(import.meta.url)
const __dirname =dirname(__filename)
let app = express();
dotenv.config({path: './.env' });
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://snakestongue.github.io"
    ],
    credentials: true
}));
app.use(express.json());
app.use(clerkMiddleware());
app.use(express.static("public"));
app.use("/", router);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../FRONTEND/index.html"));
});
let startServer = async ()=>{
    try {
        await connectDB();
        await prisma.$connect();
        console.log("PostgreSQL connected through Prisma!");
        app.listen(9000, () => {
            console.log("Currently Running <>!? ");
        });
    } catch (error) {
        console.log(error)
    }
}
startServer()
