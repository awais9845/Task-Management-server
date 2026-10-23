import express from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controller/task.controller.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/createTask", upload.single("thumbnail"), createTask);
router.get("/getTasks", getTasks);
router.get("/getTask/:id", getTaskById);
router.put("/updateTask/:id", upload.single("thumbnail"), updateTask);
router.delete("/deleteTask/:id", deleteTask);

export default router;
