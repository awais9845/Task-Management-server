import express from "express";
import connectDB from "./config/connectDB.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes/index.routes.js";

const app = express();
config();
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "wroking correctly ",
  });
});

app.listen(2000, (req, res) => {
  console.log(`http://localhost:${2000}`);
});
