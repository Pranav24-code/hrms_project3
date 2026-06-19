import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";

export const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const user = await User.findById(employeeId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance =
      await Attendance.findOne({
        employee: employeeId,
        date: today,
      });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    const now = new Date();

    let status = "present";

    if (now.getHours() >= 10) {
      status = "late";
    }

    const attendance =
      await Attendance.create({
        employee: user._id,
        employeeId: user.employeeId,
        date: today,
        checkIn: now,
        status,
      });

    res.status(201).json({
      success: true,
      message: "Checked in successfully",
      attendance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance =
      await Attendance.findOne({
        employee: employeeId,
        date: today,
      });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Already checked out",
      });
    }

    const checkoutTime = new Date();

    const workingHours =
      (checkoutTime - attendance.checkIn) /
      (1000 * 60 * 60);

    attendance.checkOut = checkoutTime;
    attendance.workingHours =
      Number(workingHours.toFixed(2));

    if (workingHours < 4) {
      attendance.status = "half_day";
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Checked out successfully",
      attendance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const attendance =
      await Attendance.find({
        date: today,
      })
        .populate(
          "employee",
          "name email employeeId"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getEmployeeAttendance =
  async (req, res) => {
    try {
      const attendance =
        await Attendance.find({
          employee: req.params.id,
        }).sort({ date: -1 });

      res.status(200).json({
        success: true,
        attendance,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };

  export const getAttendanceStats =
  async (req, res) => {
    try {
      const present =
        await Attendance.countDocuments({
          status: "present",
        });

      const absent =
        await Attendance.countDocuments({
          status: "absent",
        });

      const late =
        await Attendance.countDocuments({
          status: "late",
        });

      const onLeave =
        await Attendance.countDocuments({
          status: "on_leave",
        });

      res.status(200).json({
        success: true,
        stats: {
          present,
          absent,
          late,
          onLeave,
        },
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };