const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { upload } = require("../config/cloudinary");
const {
  submitComplaintController,
  getMyComplaintsController,
  getComplaintByIdController,
  updateComplaintController,
  deleteComplaintController,
} = require("../controllers/complaintController");

// ─── All routes require authentication ────────────────────
router.post("/submit",         authMiddleware, upload.single("image"), submitComplaintController);
router.get("/my",              authMiddleware, getMyComplaintsController);
router.get("/:id",             authMiddleware, getComplaintByIdController);

// ─── Update complaint (user can edit while still Pending) ──
router.put("/update/:id",      authMiddleware, upload.single("image"), updateComplaintController);

router.delete("/delete/:id",   authMiddleware, deleteComplaintController);

module.exports = router;
