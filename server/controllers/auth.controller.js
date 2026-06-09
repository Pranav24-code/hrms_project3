import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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