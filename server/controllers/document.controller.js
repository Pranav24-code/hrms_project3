import Document from "../models/document.model.js";

// Upload a document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const { documentType, userId } = req.body;
    const targetUserId = userId || req.user?.id;

    const doc = await Document.create({
      userId: targetUserId,
      documentType: documentType || "Other",
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({ success: true, message: "Document uploaded", document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get documents for a specific user
export const getUserDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.params.userId })
      .sort({ uploadedAt: -1 });
    res.status(200).json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all documents (manager view)
export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find()
      .populate("userId", "name email employeeId role")
      .sort({ uploadedAt: -1 });
    res.status(200).json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a document
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
    res.status(200).json({ success: true, message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
