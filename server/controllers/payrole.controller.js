import Payroll from "../models/payroll.model.js";
import Employee from "../models/employee.model.js";
import Leave from "../models/leave.model.js";

export const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee, month and year are required",
      });
    }

    // Employee Details
    const employee = await Employee.findById(employeeId).populate("user");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check payroll already exists
    const exists = await Payroll.findOne({
      employee: employee.user._id,
      month,
      year,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Payroll already generated",
      });
    }

    // Approved Leaves
    const approvedLeaves = await Leave.find({
      employee: employee.user._id,
      status: "approved",
      startDate: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    });

    let totalLeaveDays = 0;

    approvedLeaves.forEach((leave) => {
      totalLeaveDays += leave.totalDays;
    });

    const basicSalary = employee.basicSalary || 0;
    const allowance = employee.allowance || 0;
    const bonus = employee.bonus || 0;

    // 20% HRA
    const hra = basicSalary * 0.2;

    // Per Day Salary
    const perDaySalary = basicSalary / 30;

    // Leave Deduction
    const leaveDeduction = totalLeaveDays * perDaySalary;

    // Gross Salary
    const grossSalary =
      basicSalary +
      hra +
      allowance +
      bonus;

    // Tax 10%
    const tax = grossSalary * 0.1;

    const deductions = leaveDeduction;

    const netSalary =
      grossSalary -
      tax -
      deductions;

    const payroll = await Payroll.create({
      employee: employee.user._id,
      employeeId: employee.employeeId,
      month,
      year,
      basicSalary,
      hra,
      allowance,
      bonus,
      tax,
      deductions,
      leaveDeduction,
      grossSalary,
      netSalary,
      status: "processed",
      generatedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Payroll generated successfully",
      payroll,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};