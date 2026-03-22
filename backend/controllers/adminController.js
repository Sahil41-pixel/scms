const complaintModel = require("../models/complaintModel");
const userModel = require("../models/userModel");

// ─── Get all complaints with optional filters ───────────────
const getAllComplaintsController = async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    const filter = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await complaintModel
      .find(filter)
      .populate("submittedBy", "username email")
      .populate("assignedTo", "username email")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Dashboard stats ────────────────────────────────────────
const getDashboardStatsController = async (req, res) => {
  try {
    const [
      totalUsers,
      totalComplaints,
      pendingCount,
      inProgressCount,
      onWorkingCount,
      resolvedCount,
      rejectedCount,
      employeeCount,
    ] = await Promise.all([
      userModel.countDocuments({ role: "user" }),
      complaintModel.countDocuments(),
      complaintModel.countDocuments({ status: "Pending" }),
      complaintModel.countDocuments({ status: "In Progress" }),
      complaintModel.countDocuments({ status: "On Working" }),
      complaintModel.countDocuments({ status: "Resolved" }),
      complaintModel.countDocuments({ status: "Rejected" }),
      userModel.countDocuments({ role: "employee" }),
    ]);

    res.status(200).send({
      success: true,
      stats: {
        totalUsers,
        totalComplaints,
        pendingCount,
        inProgressCount,
        onWorkingCount,
        resolvedCount,
        rejectedCount,
        employeeCount,
      },
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Assign complaint to an employee ────────────────────────
// Admin's PRIMARY action: pick an employee → complaint goes "In Progress"
// Can re-assign to a different employee (if not yet Resolved/Rejected)
const assignComplaintController = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const { id } = req.params;

    if (!employeeId) {
      return res.status(400).send({
        success: false,
        message: "Please select an employee to assign this complaint to.",
      });
    }

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).send({ success: false, message: "Complaint not found" });
    }

    // Cannot assign if already Resolved or Rejected
    if (complaint.status === "Resolved" || complaint.status === "Rejected") {
      return res.status(400).send({
        success: false,
        message: `Cannot assign a complaint that is already "${complaint.status}".`,
      });
    }

    const employee = await userModel.findById(employeeId);
    if (!employee || employee.role !== "employee") {
      return res.status(400).send({
        success: false,
        message: "Invalid employee. Please select a valid employee.",
      });
    }

    const isReassignment = complaint.assignedTo !== null;

    const updatedComplaint = await complaintModel.findByIdAndUpdate(
      id,
      {
        assignedTo: employeeId,
        status: "In Progress",
        $push: {
          timeline: {
            stage: isReassignment ? "Re-assigned to Employee" : "Assigned to Employee",
            note: isReassignment
              ? `Complaint re-assigned to ${employee.username} for resolution.`
              : `Complaint assigned to ${employee.username} for resolution.`,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    ).populate("assignedTo", "username email");

    res.status(200).send({
      success: true,
      message: `Complaint assigned to ${employee.username}`,
      complaint: updatedComplaint,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Reject a complaint (Admin only, requires a remark) ──────
// Admin can reject any complaint that is Pending or In Progress
// A rejection remark is MANDATORY — explains why it was rejected
const rejectComplaintController = async (req, res) => {
  try {
    const { adminRemark } = req.body;
    const { id } = req.params;

    // Remark is mandatory for rejection
    if (!adminRemark || adminRemark.trim() === "") {
      return res.status(400).send({
        success: false,
        message: "Please provide a reason/remark for rejecting this complaint. This is mandatory.",
      });
    }

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).send({ success: false, message: "Complaint not found" });
    }

    // Cannot reject an already Resolved complaint
    if (complaint.status === "Resolved") {
      return res.status(400).send({
        success: false,
        message: "Cannot reject a complaint that has already been Resolved.",
      });
    }

    // Cannot reject if already rejected
    if (complaint.status === "Rejected") {
      return res.status(400).send({
        success: false,
        message: "This complaint is already rejected.",
      });
    }

    const updatedComplaint = await complaintModel.findByIdAndUpdate(
      id,
      {
        status: "Rejected",
        adminRemark: adminRemark.trim(),
        $push: {
          timeline: {
            stage: "Rejected",
            note: `Rejected by admin. Reason: ${adminRemark.trim()}`,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    ).populate("submittedBy", "username email");

    res.status(200).send({
      success: true,
      message: "Complaint has been rejected",
      complaint: updatedComplaint,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Get all users (role: user) for promotion ───────────────
const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel
      .find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).send({ success: true, users });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Get all employees ──────────────────────────────────────
const getAllEmployeesController = async (req, res) => {
  try {
    const employees = await userModel
      .find({ role: "employee" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).send({ success: true, employees });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Promote a user to employee ────────────────────────────
const promoteToEmployeeController = async (req, res) => {
  try {
    const user = await userModel
      .findByIdAndUpdate(req.params.id, { role: "employee" }, { new: true })
      .select("-password");

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    res.status(200).send({
      success: true,
      message: `${user.username} has been promoted to employee`,
      user,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Demote an employee back to user ────────────────────────
const demoteToUserController = async (req, res) => {
  try {
    const user = await userModel
      .findByIdAndUpdate(req.params.id, { role: "user" }, { new: true })
      .select("-password");

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    res.status(200).send({
      success: true,
      message: `${user.username} has been demoted back to user`,
      user,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  getAllComplaintsController,
  getDashboardStatsController,
  assignComplaintController,
  rejectComplaintController,
  getAllUsersController,
  getAllEmployeesController,
  promoteToEmployeeController,
  demoteToUserController,
};
