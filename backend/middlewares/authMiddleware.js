const jwt = require("jsonwebtoken");

// ─── Verify JWT token from request headers ─────────────────
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized: No token provided. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized: Invalid or expired token. Please login again.",
    });
  }
};

module.exports = authMiddleware;
