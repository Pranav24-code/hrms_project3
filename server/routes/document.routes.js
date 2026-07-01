import express from "express";
import { uploadDocument, getUserDocuments, getAllDocuments, deleteDocument } from "../controllers/document.controller.js";
import upload from "../middleware/upload.middleware.js";
import { verifyToken } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/upload", verifyToken, upload.single("file"), uploadDocument);
router.get("/all", verifyToken, getAllDocuments);
router.get("/user/:userId", verifyToken, getUserDocuments);
router.delete("/:id", verifyToken, deleteDocument);

export default router;
