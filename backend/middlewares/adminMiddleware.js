const userModel = require("../models/userModel");

// ─── Check if the logged-in user is an admin ───────────────
// Must be used AFTER authMiddleware (needs req.body.id)
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Access denied. This route is for admins only.",
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

module.exports = adminMiddleware;
