const mongoose = require("mongoose");

// ─── Timeline Entry Sub-Schema ─────────────────────────────
const timelineSchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// ─── Complaint Schema ──────────────────────────────────────
const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Infrastructure", "Hostel", "Food", "Transport", "Cleanliness", "Other"],
    },
    status: {
      type: String,
      // Pending    → freshly submitted, awaiting admin action
      // In Progress → set when admin assigns to an employee
      // On Working  → employee has started working on it
      // Resolved    → employee resolved with proof image
      // Rejected    → admin rejected with mandatory remark
      enum: ["Pending", "In Progress", "On Working", "Resolved", "Rejected"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    resolvedImageUrl: {
      type: String,
      default: "",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    // Admin fills this ONLY when rejecting — mandatory for rejection
    adminRemark: {
      type: String,
      default: "",
    },
    timeline: [timelineSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("complaints", complaintSchema);
