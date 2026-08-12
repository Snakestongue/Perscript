import cors from "cors"
import express from "express";
import path from "path"
import { fileURLToPath } from "url"
import { dirname} from "path"
import router from "./routes.js"
import dotenv from "dotenv"
import connectDB from "./database.js"
const __filename =fileURLToPath(import.meta.url)
const __dirname =dirname(__filename)
let app = express();
dotenv.config({path: './.env' });
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/", router);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../FRONTEND/index.html"));
});
let startServer = async ()=>{
    try {
        await connectDB();
        app.listen(9000, () => {
            console.log("Currently Running <>!? ");
        });
    } catch (error) {
        console.log(error)
    }
}
startServer()
