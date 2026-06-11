import  express from "express";
import authRoutes from "./auth.route.js";
import employeeRoutes from "./employee.route.js"

const router = express.Router();


router.use("/auth", authRoutes);
router.use("/employee",employeeRoutes)

export default router;