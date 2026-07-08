import express from "express";
import {
  processPayroll,
  getAllPayroll,
  getMyPayroll,
  getPayslipById,
  updatePayrollStatus,
  deletePayrollRecord,
} from "../controllers/payroll.controller.js";
import { verifyToken } from "../middleware/authmiddleware.js";

const router = express.Router();

// Apply verifyToken middleware to all payroll routes
router.use(verifyToken);

router.post("/process", processPayroll);
router.get("/all", getAllPayroll);
router.get("/my", getMyPayroll);
router.get("/payslip/:id", getPayslipById);
router.put("/status/:id", updatePayrollStatus);
router.delete("/delete/:id", deletePayrollRecord);

export default router;
