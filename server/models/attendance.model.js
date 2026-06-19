import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: { type: String, required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    workingHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day", "on_leave"],
      default: "present",
    },
  },
  { timestamps: true },
);

attendanceSchema.index(
  {
    employee: 1,
    date: 1,
  },
  { unique: true },
);

export default mongoose.model("Attendance", attendanceSchema);
