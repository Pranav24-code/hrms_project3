import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employeeId: String,

    month: Number,
    year: Number,

    basicSalary: Number,
    hra: Number,
    allowance: Number,
    bonus: Number,

    tax: Number,
    deductions: Number,
    leaveDeduction: Number,

    grossSalary: Number,
    netSalary: Number,

    status: {
      type: String,
      enum: ["pending", "processed", "paid"],
      default: "pending",
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    paidDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Payroll", payrollSchema);