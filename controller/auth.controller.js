import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

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
      return res.status(400).json({
        success: false,
        message: "password is required",
      });
    }
    const existUser = await User.findOne({ email }).select("+password");

    if (!existUser) {
      return res.status(401).status({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!existUser.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account does not have a password. Please sign in with Google.",
      });
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      existUser.password,
    );

    if (!isPasswordMatched) {
      return res.status(401).status({
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
      message: error.message,
    });
  }
};

// continue with google

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google credential",
      });
    }

    const { sub, email, name, email_verified } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check whether this Google account already exists.
    let user = await User.findOne({ googleId: sub });

    if (!user) {
      // Check whether this email belongs to an existing account.
      user = await User.findOne({
        email: normalizedEmail,
      });

      if (user) {
        // Don't automatically link an existing password account.
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists. Please log in using your existing method.",
        });
      }

      // Save the new Google user in MongoDB.
      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        googleId: sub,
      });
    }

    const accessToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Store JWT in an HTTP-only cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
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
