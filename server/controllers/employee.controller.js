import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";
import bcrypt from "bcryptjs";

export const addEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,

      phone,
      dateOfBirth,
      gender,
      address,
      department,
      designation,
      joiningDate,

      basicSalary,
      bonus,
      allowance,
    } = req.body;
    console.log(req.body);



    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }


    const prefix = role === "Manager" ? "MGR" : "EMP";

    const lastUser = await User.findOne({
      employeeId: {
        $regex: `^${prefix}`,
      },
    }).sort({
      createdAt: -1,
    });

    let nextNumber = 1;

    if (lastUser) {
      nextNumber =
        parseInt(lastUser.employeeId.replace(prefix, "")) + 1;
    }

    const employeeId =
      prefix + String(nextNumber).padStart(3, "0");



    const hashedPassword = await bcrypt.hash(password, 10);

    // Create login user

    const user = await User.create({
      employeeId,
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role,
    });

    // Create employee profile

    const employee = await Employee.create({
      user: user._id,

      employeeId,

      firstName,
      lastName,

      phone,
      dateOfBirth,
      gender,
      address,

      department,
      designation,
      joiningDate,

      basicSalary,
      bonus,
      allowance,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",

      user,
      employee,
    });
  } catch (err) {
      console.log("ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllEmployee = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate({
        path: "user",
        select: "-password",   
      })
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (err) {
    console.log("ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
