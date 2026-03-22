const userModel = require("../models/userModel");

// ─── Check if the logged-in user is an employee ────────────
// Must be used AFTER authMiddleware (needs req.body.id)
const employeeMiddleware = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user || user.role !== "employee") {
      return res.status(403).send({
        success: false,
        message: "Access denied. This route is for employees only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

module.exports = employeeMiddleware;
