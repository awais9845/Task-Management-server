import express from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controller/task.controller.js";

const router = express.Router();

router.post("/createTask", createTask);
router.get("/getTasks", getTasks);
router.get("/getTask/:id", getTaskById);
router.put("/updateTask/:id", updateTask);
router.delete("/deleteTask/:id", deleteTask);

export default router;
