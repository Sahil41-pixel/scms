const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// ─── Load environment variables ───────────────────────────
dotenv.config();

// ─── Connect to database ───────────────────────────────────
connectDB();

const app = express();

// ─── Global middlewares ────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ─── Routes ───────────────────────────────────────────────
app.use("/api/v1/user",      require("./routes/userRoute"));
app.use("/api/v1/complaint", require("./routes/complaintRoute"));
app.use("/api/v1/admin",     require("./routes/adminRoute"));
app.use("/api/v1/employee",  require("./routes/employeeRoute"));

// ─── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send({ success: false, message: "Route not found" });
});

// ─── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
