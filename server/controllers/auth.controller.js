import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/email.js";

// Hash a raw reset token before storing it, so the DB never holds the usable token.
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

//register user
export const register = async (req,res,next)=>{
    try{
        const{name, email, password,role}= req.body;
      const existingUser = await User.findOne({ email });

console.log("Email received:", email);
console.log("Existing user:", existingUser);

        if(existingUser){
            return res.status(400).json({success: false, message:"User already exists"});
        }
        const prefix = role ==="Manager" ? "MGR" : "EMP";

       const lastUser = await User.findOne({
      employeeId: { $regex: `^${prefix}` },
    }).sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastUser) {
      nextNumber =
        parseInt(lastUser.employeeId.slice(1)) + 1;
    }

    const employeeId = `${prefix}${String(nextNumber).padStart(
      3,
      "0"
    )}`;

    const hashedPassword = await bcrypt.hash(password,10);

    const newuser = await User.create({
        employeeId,
        name,
        email,
        password: hashedPassword,
        role
    })

    res.status(201).json({success:true,message:"User registered successfully",newuser});
  
}catch(error){
    res.status(500).json({success:false,message:"Server error",error:error.message});
}
}

//login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact admin.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        employeeId: user.employeeId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//forgot password - generate token and email a reset link
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Generic response regardless of whether the user exists,
    // so the endpoint can't be used to enumerate registered emails.
    const genericResponse = {
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(rawToken);
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:8080";
    const resetUrl = `${clientUrl}/#/reset-password?token=${rawToken}`;

    try {
      await sendResetPasswordEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    } catch (mailError) {
      // Roll back the token if the email could not be delivered.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Could not send reset email. Please try again later.",
        error: mailError.message,
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//reset password - validate token and set new password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now sign in.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};