const express = require("express");
const router = express.Router();
const authMiddleware  = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
  getAllComplaintsController,
  getDashboardStatsController,
  assignComplaintController,
  rejectComplaintController,
  getAllUsersController,
  getAllEmployeesController,
  promoteToEmployeeController,
  demoteToUserController,
} = require("../controllers/adminController");

// ─── All admin routes require: auth + admin role ───────────
router.get("/stats",              authMiddleware, adminMiddleware, getDashboardStatsController);
router.get("/complaints",         authMiddleware, adminMiddleware, getAllComplaintsController);
router.get("/users",              authMiddleware, adminMiddleware, getAllUsersController);
router.get("/employees",          authMiddleware, adminMiddleware, getAllEmployeesController);

// ─── Assign complaint to employee ─────────────────────────
router.patch("/assign/:id",       authMiddleware, adminMiddleware, assignComplaintController);

// ─── Reject complaint (mandatory remark) ──────────────────
router.patch("/reject/:id",       authMiddleware, adminMiddleware, rejectComplaintController);

// ─── User management ──────────────────────────────────────
router.patch("/promote/:id",      authMiddleware, adminMiddleware, promoteToEmployeeController);
router.patch("/demote/:id",       authMiddleware, adminMiddleware, demoteToUserController);

module.exports = router;
