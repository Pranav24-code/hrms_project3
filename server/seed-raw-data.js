import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Employee from "./models/employee.model.js";
import Leave from "./models/leave.model.js";
import Attendance from "./models/attendance.model.js";
import Payroll from "./models/payroll.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

const seedRawData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Find the default users created by index.js or create them if they don't exist
    let manager = await User.findOne({ email: "hr@nexahr.com" });
    if (!manager) {
      manager = await User.create({
        employeeId: "MGR001",
        name: "HR Manager",
        email: "hr@nexahr.com",
        password: await bcrypt.hash("Admin@123", 10),
        role: "Manager",
        isActive: true,
      });
    }

    let employee = await User.findOne({ email: "employee@nexahr.com" });
    if (!employee) {
      employee = await User.create({
        employeeId: "EMP001",
        name: "John Employee",
        email: "employee@nexahr.com",
        password: await bcrypt.hash("Admin@123", 10),
        role: "Employee",
        isActive: true,
      });
    }

    // Insert Employee profile for John Employee
    let empProfile = await Employee.findOne({ user: employee._id });
    if (!empProfile) {
      empProfile = await Employee.create({
        user: employee._id,
        employeeId: employee.employeeId,
        firstName: "John",
        lastName: "Employee",
        phone: "+1 555-0100",
        dateOfBirth: new Date("1990-01-15"),
        gender: "Male",
        department: "Engineering",
        designation: "Software Engineer",
        joiningDate: new Date("2023-05-10"),
        basicSalary: 60000,
      });
      console.log("Created Employee Profile");
    }

    // Insert Leave Request
    let leave = await Leave.findOne({ employee: employee._id });
    if (!leave) {
      await Leave.create({
        employee: employee._id,
        employeeId: employee.employeeId,
        leaveType: "sick",
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        totalDays: 2,
        reason: "Flu symptoms",
        status: "pending",
      });
      console.log("Created Leave Request");
    }

    // Insert Attendance
    let attendance = await Attendance.findOne({ employee: employee._id, date: new Date().setHours(0,0,0,0) });
    if (!attendance) {
      await Attendance.create({
        employee: employee._id,
        employeeId: employee.employeeId,
        date: new Date().setHours(0,0,0,0),
        checkIn: new Date(new Date().setHours(9, 0, 0, 0)),
        checkOut: new Date(new Date().setHours(17, 0, 0, 0)),
        workingHours: 8,
        status: "present",
      });
      console.log("Created Attendance");
    }

    // Insert Payroll
    let payroll = await Payroll.findOne({ employee: employee._id });
    if (!payroll) {
      await Payroll.create({
        employee: employee._id,
        employeeId: employee.employeeId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: 5000,
        hra: 1000,
        allowance: 500,
        bonus: 0,
        tax: 500,
        deductions: 200,
        leaveDeduction: 0,
        grossSalary: 6500,
        netSalary: 5800,
        status: "paid",
        generatedBy: manager._id,
        paidDate: new Date(),
      });
      console.log("Created Payroll");
    }

    console.log("Successfully seeded raw data into MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedRawData();
