import { Task } from "../models/task.model.js";

// 1. Create Task
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      techStacks,
      thumbnail,
      priority,
      status,
      dueDate,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task description is required",
      });
    }

    if (!Array.isArray(techStacks) || techStacks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one technology is required",
      });
    }

    if (
      priority !== undefined &&
      !["Low", "Medium", "High"].includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    if (
      status !== undefined &&
      !["Todo", "InProgress", "Completed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    if (
      dueDate !== undefined &&
      dueDate !== null &&
      (Number.isNaN(Date.parse(dueDate)) || typeof dueDate !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      techStacks,
      thumbnail,
      priority,
      status,
      dueDate,
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get All Tasks + Search + Filter

export const getTasks = async (req, res) => {
  try {
    const { search, priority, status, dueBefore, dueAfter } = req.query;

    const filter = {
      user: req.user.id,
    };

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter tasks by due date
    if (dueAfter || dueBefore) {
      filter.dueDate = {};

      if (dueAfter) {
        filter.dueDate.$gte = new Date(dueAfter);
      }

      if (dueBefore) {
        filter.dueDate.$lte = new Date(dueBefore);
      }
    }

    // Find tasks and show newest ones first
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get tasks",
    });
  }
};

// 3. Get Single Task
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Update Task

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Get updated data from frontend
    const {
      title,
      description,
      techStacks,
      thumbnail,
      priority,
      status,
      dueDate,
    } = req.body;

    // Find the task and update it
    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id,
      },
      {
        title,
        description,
        techStacks,
        thumbnail,
        priority,
        status,
        dueDate,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    // If task does not exist
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
