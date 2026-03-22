const express = require("express");
const router = express.Router();
const authMiddleware     = require("../middlewares/authMiddleware");
const employeeMiddleware = require("../middlewares/employeeMiddleware");
const { upload } = require("../config/cloudinary");
const {
  getAssignedComplaintsController,
  updateComplaintStatusController,
  getResolvedComplaintsController,
} = require("../controllers/employeeController");

// ─── All routes require: auth + employee role ──────────────
router.get("/my-complaints", authMiddleware, employeeMiddleware, getAssignedComplaintsController);
router.get("/resolved",      authMiddleware, employeeMiddleware, getResolvedComplaintsController);

// ─── Resolve a complaint (requires proof image) ────────────
router.patch("/update/:id",  authMiddleware, employeeMiddleware, upload.single("resolvedImage"), updateComplaintStatusController);

module.exports = router;
