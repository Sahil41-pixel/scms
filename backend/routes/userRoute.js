const express = require("express");
const router = express.Router();
const {
  registerController,
  registerAdminController,
  loginController,
} = require("../controllers/userController");

// ─── Public routes (no auth required) ─────────────────────
router.post("/register",       registerController);
router.post("/admin/register", registerAdminController);
router.post("/login",          loginController);

module.exports = router;
