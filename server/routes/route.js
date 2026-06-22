import  express from "express";
import authRoutes from "./auth.route.js";
import employeeRoutes from "./employee.route.js"
import leaveRoutes from "./leave.route.js"
import attendanceRoutes from "./attendance.route.js"

const router = express.Router();


router.use("/auth", authRoutes);
router.use("/employee",employeeRoutes)
router.use("/leave",leaveRoutes)
router.use("/attendance",attendanceRoutes)

export default router;