import express from "express";
import { addEmployee, getAllEmployee } from "../controllers/employee.controller.js";

const router = express.Router();

router.post("/add", addEmployee);
router.get("/get-emp",getAllEmployee);

export default router;