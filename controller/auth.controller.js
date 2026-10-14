import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name.trim()) {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    if (!email.trim()) {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }

    if (!email.trim()) {
      return res.status(400).json({
        success: false,
        message: "password is required",
      });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const createUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      User: {
        name: createUser._id,
        name: createUser.name,
        email: createUser.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!password) {
      res.status(400).json({
        success: false,
        message: "password is required",
      });
    }
    const existUser = await User.findOne({ email }).select("+password");

    if (!existUser) {
      res.status(401).status({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      existUser.password,
    );

    if (!isPasswordMatched) {
      res.status(401).status({
        success: false,
        message: "invalid credentials",
      });
    }

    const accessToken = jwt.sign(
      { id: existUser._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: existUser._id,
        name: existUser.name,
        email: existUser.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "LogOut successfull",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
