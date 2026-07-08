import Payroll from "../models/payroll.model.js";
import Employee from "../models/employee.model.js";
import User from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";

// Helper to get name of month from index (1-12)
const getMonthName = (monthNumber) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[monthNumber - 1] || monthNumber.toString();
};

// Helper to compute salary preview for one employee given attendance data
const computeSalaryPreview = (emp, attendances, month, year) => {
  let presentCount = 0;
  let absentCount = 0;
  let halfDayCount = 0;
  let lateCount = 0;
  let onLeaveCount = 0;
  let totalWorkingHours = 0;

  for (const att of attendances) {
    if (att.status === "present") presentCount++;
    else if (att.status === "absent") absentCount++;
    else if (att.status === "half_day") halfDayCount++;
    else if (att.status === "late") lateCount++;
    else if (att.status === "on_leave") onLeaveCount++;
    totalWorkingHours += att.workingHours || 0;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyRate = (emp.basicSalary || 0) / (daysInMonth || 30);
  const leaveDeduction = Math.round(((absentCount * dailyRate) + (halfDayCount * 0.5 * dailyRate)) * 100) / 100;

  const basicSalary = emp.basicSalary || 0;
  const allowance = emp.allowance || 0;
  const bonus = emp.bonus || 0;
  const hra = Math.round((basicSalary * 0.4) * 100) / 100;
  const grossSalary = basicSalary + hra + allowance + bonus;
  const pf = Math.round((basicSalary * 0.12) * 100) / 100;
  const tax = Math.round((grossSalary * 0.1) * 100) / 100;
  const deductions = Math.round((pf + tax + leaveDeduction) * 100) / 100;
  const netSalary = Math.max(0, Math.round((grossSalary - deductions) * 100) / 100);

  return {
    presentCount,
    absentCount,
    halfDayCount,
    lateCount,
    onLeaveCount,
    totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
    totalAttendanceDays: attendances.length,
    daysInMonth,
    basicSalary,
    hra,
    allowance,
    bonus,
    leaveDeduction,
    pf,
    tax,
    deductions,
    grossSalary,
    netSalary,
  };
};

// GET /api/payroll/preview?month=X&year=Y
// Returns all employees with their attendance stats + salary preview for the month
export const getEmployeePayrollPreview = async (req, res) => {
  try {
    if (req.user.role !== "Manager") {
      return res.status(403).json({ success: false, message: "Forbidden - Manager access required" });
    }

    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: "month and year query params are required" });
    }

    const employees = await Employee.find().populate("user");
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 1);

    const result = [];

    for (const emp of employees) {
      if (!emp.user) continue;

      const attendances = await Attendance.find({
        employee: emp.user._id,
        date: { $gte: startDate, $lt: endDate },
      });

      const alreadyProcessed = await Payroll.findOne({
        employee: emp.user._id,
        month: Number(month),
        year: Number(year),
      });

      const preview = computeSalaryPreview(emp, attendances, Number(month), Number(year));

      result.push({
        userId: emp.user._id,
        employeeId: emp.employeeId,
        name: emp.user.name,
        email: emp.user.email,
        department: emp.department || "N/A",
        designation: emp.designation || "N/A",
        alreadyProcessed: !!alreadyProcessed,
        ...preview,
      });
    }

    return res.status(200).json({ success: true, employees: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payroll/process
// Now supports selective processing: body can include `selections` array with per-employee overrides
// selections: [{ userId, bonusOverride, extraDeduction }]
// If `selections` is omitted, all employees are processed with defaults.
export const processPayroll = async (req, res) => {
  try {
    if (req.user.role !== "Manager") {
      return res.status(403).json({ success: false, message: "Forbidden - Manager access required" });
    }

    const { month, year, selections } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and Year are required" });
    }

    const employees = await Employee.find().populate("user");
    let processedCount = 0;
    let skippedCount = 0;

    // Build a map of userId -> override if selections provided
    const overrideMap = new Map();
    if (Array.isArray(selections)) {
      for (const sel of selections) {
        overrideMap.set(sel.userId, sel);
      }
    }

    for (const emp of employees) {
      if (!emp.user) continue;

      // If selections were provided, skip employees not in the list
      if (selections && !overrideMap.has(emp.user._id.toString())) {
        continue;
      }

      const existing = await Payroll.findOne({
        employee: emp.user._id,
        month: Number(month),
        year: Number(year),
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);

      const attendances = await Attendance.find({
        employee: emp.user._id,
        date: { $gte: startDate, $lt: endDate },
      });

      let absentCount = 0;
      let halfDayCount = 0;
      for (const att of attendances) {
        if (att.status === "absent") absentCount++;
        else if (att.status === "half_day") halfDayCount++;
      }

      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      const dailyRate = (emp.basicSalary || 0) / (daysInMonth || 30);
      const leaveDeduction = Math.round(((absentCount * dailyRate) + (halfDayCount * 0.5 * dailyRate)) * 100) / 100;

      const override = overrideMap.get(emp.user._id.toString()) || {};

      const basicSalary = emp.basicSalary || 0;
      const allowance = emp.allowance || 0;
      // Manager can override bonus and add an extra deduction
      const bonus = override.bonusOverride !== undefined ? Number(override.bonusOverride) : (emp.bonus || 0);
      const extraDeduction = override.extraDeduction !== undefined ? Number(override.extraDeduction) : 0;
      const hra = Math.round((basicSalary * 0.4) * 100) / 100;
      const grossSalary = basicSalary + hra + allowance + bonus;
      const pf = Math.round((basicSalary * 0.12) * 100) / 100;
      const tax = Math.round((grossSalary * 0.1) * 100) / 100;
      const deductions = Math.round((pf + tax + leaveDeduction + extraDeduction) * 100) / 100;
      const netSalary = Math.max(0, Math.round((grossSalary - deductions) * 100) / 100);

      await Payroll.create({
        employee: emp.user._id,
        employeeId: emp.employeeId,
        month: Number(month),
        year: Number(year),
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

      processedCount++;
    }

    return res.status(201).json({
      success: true,
      message: `Payroll processed successfully. ${processedCount} processed, ${skippedCount} skipped (already existed).`,
      processedCount,
      skippedCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPayroll = async (req, res) => {
  try {
    if (req.user.role !== "Manager") {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Manager access required",
      });
    }

    const payrolls = await Payroll.find()
      .populate("employee", "name email employeeId role")
      .sort({ year: -1, month: -1 });

    const profiles = await Employee.find();
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const formatted = payrolls.map((p) => {
      const profile = profileMap.get(p.employee?._id?.toString() || p.employee?.toString());
      return {
        _id: p._id,
        id: p._id,
        employee: p.employee?._id,
        employeeId: p.employeeId,
        employeeName: p.employee?.name || "Unknown Employee",
        email: p.employee?.email || "",
        department: profile?.department || "N/A",
        designation: profile?.designation || "N/A",
        month: getMonthName(p.month),
        monthVal: p.month,
        year: p.year,
        basicSalary: p.basicSalary,
        hra: p.hra,
        allowance: p.allowance,
        bonus: p.bonus,
        tax: p.tax,
        deductions: p.deductions,
        leaveDeduction: p.leaveDeduction,
        grossSalary: p.grossSalary,
        netSalary: p.netSalary,
        status: p.status,
        paidDate: p.paidDate,
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      payrolls: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employee: req.user.id })
      .populate("employee", "name email employeeId")
      .sort({ year: -1, month: -1 });

    const profile = await Employee.findOne({ user: req.user.id });

    const formatted = payrolls.map((p) => {
      return {
        _id: p._id,
        id: p._id,
        employee: p.employee?._id,
        employeeId: p.employeeId,
        employeeName: p.employee?.name || "Unknown Employee",
        email: p.employee?.email || "",
        department: profile?.department || "N/A",
        designation: profile?.designation || "N/A",
        month: getMonthName(p.month),
        monthVal: p.month,
        year: p.year,
        basicSalary: p.basicSalary,
        hra: p.hra,
        allowance: p.allowance,
        bonus: p.bonus,
        tax: p.tax,
        deductions: p.deductions,
        leaveDeduction: p.leaveDeduction,
        grossSalary: p.grossSalary,
        netSalary: p.netSalary,
        status: p.status,
        paidDate: p.paidDate,
      };
    });

    return res.status(200).json({
      success: true,
      payrolls: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPayslipById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(
      "employee",
      "name email employeeId"
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    // Security: employees can only view their own payslip. Managers can view any.
    if (req.user.role !== "Manager" && payroll.employee?._id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Access denied",
      });
    }

    const profile = await Employee.findOne({ user: payroll.employee?._id });

    const formatted = {
      _id: payroll._id,
      id: payroll._id,
      employee: payroll.employee?._id,
      employeeId: payroll.employeeId,
      employeeName: payroll.employee?.name || "Unknown Employee",
      email: payroll.employee?.email || "",
      department: profile?.department || "N/A",
      designation: profile?.designation || "N/A",
      month: getMonthName(payroll.month),
      monthVal: payroll.month,
      year: payroll.year,
      basicSalary: payroll.basicSalary,
      hra: payroll.hra,
      allowance: payroll.allowance,
      bonus: payroll.bonus,
      tax: payroll.tax,
      deductions: payroll.deductions,
      leaveDeduction: payroll.leaveDeduction,
      grossSalary: payroll.grossSalary,
      netSalary: payroll.netSalary,
      status: payroll.status,
      paidDate: payroll.paidDate,
    };

    return res.status(200).json({
      success: true,
      payroll: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePayrollStatus = async (req, res) => {
  try {
    if (req.user.role !== "Manager") {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Manager access required",
      });
    }

    const { status } = req.body;

    const updateData = { status };
    if (status === "paid") {
      updateData.paidDate = new Date();
    } else {
      updateData.paidDate = null;
    }

    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Payroll status updated to ${status}`,
      payroll,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePayrollRecord = async (req, res) => {
  try {
    if (req.user.role !== "Manager") {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Manager access required",
      });
    }

    const payroll = await Payroll.findByIdAndDelete(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payroll record deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
