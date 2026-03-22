const complaintModel = require("../models/complaintModel");

// ─── Submit a new complaint ────────────────────────────────
const submitComplaintController = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).send({
        success: false,
        message: "Please provide title, description, and category",
      });
    }

    const imageUrl = req.file ? req.file.path : "";

    const complaint = await complaintModel.create({
      title,
      description,
      category,
      priority: priority || "Medium",
      imageUrl,
      submittedBy: req.user.id,
      timeline: [
        {
          stage: "Submitted",
          note: "Complaint submitted successfully and is awaiting review.",
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).send({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Get all complaints by logged-in user ──────────────────
// Includes ALL statuses — user can see Rejected complaints too
const getMyComplaintsController = async (req, res) => {
  try {
    const complaints = await complaintModel
      .find({ submittedBy: req.user.id })
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

// ─── Get single complaint by ID (with full timeline) ───────
const getComplaintByIdController = async (req, res) => {
  try {
    const complaint = await complaintModel
      .findById(req.params.id)
      .populate("submittedBy", "username email")
      .populate("assignedTo", "username email");

    if (!complaint) {
      return res.status(404).send({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).send({ success: true, complaint });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Update a complaint (only by owner, only if Pending) ────
// User can update: title, description, category, priority, image
// Blocked if status is anything other than "Pending"
const updateComplaintController = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const complaintId = req.params.id;

    const complaint = await complaintModel.findById(complaintId);

    if (!complaint) {
      return res.status(404).send({ success: false, message: "Complaint not found" });
    }

    // Security: only the owner can edit
    if (complaint.submittedBy.toString() !== req.user.id) {
      return res.status(403).send({
        success: false,
        message: "You can only edit your own complaints",
      });
    }

    // Business rule: can only edit while still Pending (not assigned/resolved/rejected)
    if (complaint.status !== "Pending") {
      return res.status(400).send({
        success: false,
        message: `You cannot edit a complaint that is already "${complaint.status}". Only Pending complaints can be edited.`,
      });
    }

    // Build update object — only update fields that were provided
    const updateFields = {};
    if (title)       updateFields.title       = title;
    if (description) updateFields.description = description;
    if (category)    updateFields.category    = category;
    if (priority)    updateFields.priority    = priority;

    // If a new image was uploaded, update it
    if (req.file) {
      updateFields.imageUrl = req.file.path;
    }

    // Push a timeline entry to record the edit
    const updatedComplaint = await complaintModel.findByIdAndUpdate(
      complaintId,
      {
        ...updateFields,
        $push: {
          timeline: {
            stage: "Complaint Updated",
            note: "User updated the complaint details.",
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Complaint updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// ─── Delete a complaint (by the user who submitted it) ─────
// Only allowed if complaint is still Pending
const deleteComplaintController = async (req, res) => {
  try {
    const complaint = await complaintModel.findById(req.params.id);

    if (!complaint) {
      return res.status(404).send({ success: false, message: "Complaint not found" });
    }

    if (complaint.submittedBy.toString() !== req.user.id) {
      return res.status(403).send({
        success: false,
        message: "You can only delete your own complaints",
      });
    }

    if (complaint.status !== "Pending") {
      return res.status(400).send({
        success: false,
        message: `Cannot delete a complaint with status "${complaint.status}". Only Pending complaints can be deleted.`,
      });
    }

    await complaintModel.findByIdAndDelete(req.params.id);

    res.status(200).send({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  submitComplaintController,
  getMyComplaintsController,
  getComplaintByIdController,
  updateComplaintController,
  deleteComplaintController,
};
