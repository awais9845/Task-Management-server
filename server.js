import "dotenv/config";
import express from "express";
import connectDB from "./config/connectDB.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.routes.js";

const app = express();
connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-management-client-ruby.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "wroking correctly ",
  });
});

// app.listen(2000, (req, res) => {
//   console.log(`http://localhost:${2000}`);
// });

export default app;
