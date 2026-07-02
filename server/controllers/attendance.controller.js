import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";

const getDayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const syncAggregateAttendanceFields = (attendance) => {
  const sessions = attendance.sessions || [];

  if (sessions.length === 0) {
    attendance.checkIn = null;
    attendance.checkOut = null;
    attendance.workingHours = 0;
    return;
  }

  attendance.checkIn = sessions[0].checkIn;

  const lastSession = sessions[sessions.length - 1];
  attendance.checkOut = lastSession.checkOut || null;

  const totalWorkingHours = sessions.reduce((sum, session) => {
    if (!session.checkOut) return sum;
    return sum + (session.checkOut - session.checkIn) / (1000 * 60 * 60);
  }, 0);

  attendance.workingHours = Number(totalWorkingHours.toFixed(2));
};

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

    const today = getDayStart();
    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    const now = new Date();

    if (existingAttendance) {
      const sessions = existingAttendance.sessions || [];
      const lastSession = sessions[sessions.length - 1];

      if (lastSession && !lastSession.checkOut) {
        return res.status(400).json({
          success: false,
          message: "Already checked in. Please check out first.",
        });
      }

      sessions.push({
        checkIn: now,
      });

      existingAttendance.sessions = sessions;
      if (existingAttendance.status === "absent") {
        existingAttendance.status = now.getHours() >= 10 ? "late" : "present";
      }

      syncAggregateAttendanceFields(existingAttendance);
      await existingAttendance.save();

      return res.status(200).json({
        success: true,
        message: "Checked in successfully",
        attendance: existingAttendance,
      });
    }

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
        sessions: [{ checkIn: now }],
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

    const today = getDayStart();

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

    const sessions = attendance.sessions || [];
    const lastSession = sessions[sessions.length - 1];

    if (!lastSession || !lastSession.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Please check in first",
      });
    }

    if (lastSession.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Already checked out. Please check in again for a new session.",
      });
    }

    const checkoutTime = new Date();

    const sessionWorkingHours =
      (checkoutTime - lastSession.checkIn) /
      (1000 * 60 * 60);

    lastSession.checkOut = checkoutTime;
    lastSession.workingHours = Number(sessionWorkingHours.toFixed(2));
    attendance.sessions = sessions;

    syncAggregateAttendanceFields(attendance);

    if (attendance.workingHours < 4) {
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

export const getAttendanceHistory = async (req, res) => {
  try {
    const { employeeId } = req.query;

    const filter = employeeId ? { employee: employeeId } : {};

    const attendance = await Attendance.find(filter)
      .populate("employee", "name email employeeId role")
      .sort({ date: -1, createdAt: -1 });

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


  export const getTodayEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

      const today = getDayStart();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (attendance) {
      syncAggregateAttendanceFields(attendance);
    }

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