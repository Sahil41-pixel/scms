const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─── Register a new user ────────────────────────────────────
const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide username, email, and password",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Email is already registered. Please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).send({
      success: true,
      message: "Account created successfully! Please login.",
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Register a new admin (requires secret key) ─────────────
const registerAdminController = async (req, res) => {
  try {
    const { username, email, password, secretKey } = req.body;

    if (!username || !email || !password || !secretKey) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields including the admin secret key",
      });
    }

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).send({
        success: false,
        message: "Invalid admin secret key. Access denied.",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).send({
      success: true,
      message: "Admin account created successfully! Please login.",
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Login (works for all roles: user, admin, employee) ─────
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No account found with this email. Please register first.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).send({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: `Welcome back, ${user.username}!`,
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        role:     user.role,
      },
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = { registerController, registerAdminController, loginController };
