import express from "express";
import {
  generatePayroll,
  getAllPayrolls,
  generateAllPayrolls
} from "../controllers/payrole.controller.js";



const router = express.Router();

router.post("/generate", generatePayroll);
router.get("/all", getAllPayrolls);
router.post("/generate-all", generateAllPayrolls);

export default router;