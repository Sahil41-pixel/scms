const complaintModel = require("../models/complaintModel");

// ─── Get all complaints assigned to this employee ──────────
const getAssignedComplaintsController = async (req, res) => {
  try {
    const complaints = await complaintModel
      .find({ assignedTo: req.user.id, status: { $in: ["In Progress", "On Working"] } })
      .populate("submittedBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).send({ success: true, count: complaints.length, complaints });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Update complaint status ────────────────────────────────
// Employee can set:
//   "On Working"  → just a note, no image needed
//   "Resolved"    → requires a proof image (mandatory)
// Cannot go backwards or set Rejected/Pending
const updateComplaintStatusController = async (req, res) => {
  try {
    const { status, note } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["On Working", "Resolved"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).send({
        success: false,
        message: `Employees can only set status to "On Working" or "Resolved".`,
      });
    }

    const complaint = await complaintModel.findById(id);

    if (!complaint) {
      return res.status(404).send({ success: false, message: "Complaint not found" });
    }

    // Security: employee can only update complaints assigned to them
    if (complaint.assignedTo?.toString() !== req.user.id) {
      return res.status(403).send({
        success: false,
        message: "You can only update complaints assigned to you.",
      });
    }

    // Cannot update an already resolved complaint
    if (complaint.status === "Resolved") {
      return res.status(400).send({
        success: false,
        message: "This complaint is already Resolved and cannot be updated.",
      });
    }

    // Build update object based on status
    let updateData = {};

    if (status === "On Working") {
      // No image required — just update status and add timeline entry
      updateData = {
        status: "On Working",
        $push: {
          timeline: {
            stage: "On Working",
            note: note?.trim() || "Employee has started working on this complaint.",
            timestamp: new Date(),
          },
        },
      };
    } else if (status === "Resolved") {
      // Proof image is MANDATORY for resolution
      if (!req.file) {
        return res.status(400).send({
          success: false,
          message: "Please attach a resolution proof image. This is required to mark as Resolved.",
        });
      }
      updateData = {
        status: "Resolved",
        resolvedImageUrl: req.file.path,
        $push: {
          timeline: {
            stage: "Resolved",
            note: note?.trim() || "Complaint has been resolved successfully.",
            timestamp: new Date(),
          },
        },
      };
    }

    const updatedComplaint = await complaintModel.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).send({
      success: true,
      message: `Complaint marked as ${status}`,
      complaint: updatedComplaint,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Get resolved complaints for this employee ──────────────
const getResolvedComplaintsController = async (req, res) => {
  try {
    const complaints = await complaintModel
      .find({ assignedTo: req.user.id, status: "Resolved" })
      .populate("submittedBy", "username email")
      .sort({ updatedAt: -1 });

    res.status(200).send({ success: true, complaints });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  getAssignedComplaintsController,
  updateComplaintStatusController,
  getResolvedComplaintsController,
};
