import Leave from "../models/leave.model.js";
import User from "../models/user.model.js"
import { io, userSocketMap } from "../index.js";

const emitLeaveListUpdateToManagers = async (payload) => {
  const managers = await User.find({ role: "Manager", isActive: true }).select("_id");

  for (const manager of managers) {
    const managerSocketId = userSocketMap[manager._id.toString()];
    if (managerSocketId) {
      io.to(managerSocketId).emit("leave_list_updated", payload);
    }
  }
};

export const applyLeave =async (req, res)=>{
try{
    const{
        employee,leaveType,
      startDate,endDate,
      reason,
    }=req.body

const user = await User.findById(employee)

 if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

     const totalDays =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) /
          (1000 * 60 * 60 * 24)
      ) + 1;

       const leave = await Leave.create({
      employee,
      employeeId: user.employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    });

    await emitLeaveListUpdateToManagers({
      action: "created",
      leaveId: leave._id,
      leaveType: leave.leaveType,
      message: "A new leave request was submitted.",
    });

  res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      leave,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email employeeId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.params.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leaves,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const updateLeaveStatus = async (req, res) => {
  try {
    const {
      status,
      managerRemark,
      approvedBy,
    } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        managerRemark,
        approvedBy,
      },
      {
        new: true,
      }
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    // Emit real-time notification to the employee
    const employeeSocketId = userSocketMap[leave.employee?.toString()];
    if (employeeSocketId) {
      io.to(employeeSocketId).emit("leave_status_updated", {
        status,
        leaveType: leave.leaveType,
        message: `Your ${leave.leaveType} leave request has been ${status}.`,
      });
    }

    await emitLeaveListUpdateToManagers({
      action: "status_changed",
      leaveId: leave._id,
      status: leave.status,
      leaveType: leave.leaveType,
      message: `Leave request ${leave.status}.`,
    });

    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      leave,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getLatestPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "pending" })
      .populate("employee", "name email employeeId")
      .sort({ createdAt: -1 }) // newest requests first
      .limit(5);

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get approved leaves for calendar view (optional date range filtering)
export const getApprovedLeavesForCalendar = async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = { status: "approved" };
    if (start && end) {
      filter.startDate = { $gte: new Date(start) };
      filter.endDate = { $lte: new Date(end) };
    }
    const leaves = await Leave.find(filter)
      .populate("employee", "name email employeeId")
      .sort({ startDate: 1 });

    res.status(200).json({ success: true, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};