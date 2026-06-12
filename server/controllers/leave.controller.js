import Leave from "../models/leave.model.js";
import User from "../models/user.model.js"

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
    const { status, managerRemark, approvedBy } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        managerRemark,
        approvedBy,
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Leave ${status}`,
      leave,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};