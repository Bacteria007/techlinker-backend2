const Internship = require("../../models/internships");
const Application = require("../../models/applicationModel");
const Student = require("../../models/students");

// 📬 POST: Add internship
exports.addInternship = async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      type,
      education,
      stipend,
      joblevel,
      instituteId,
      deadline,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
        success: false,
        data: null,
      });
    }

    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!type) missingFields.push("type");
    if (!joblevel) missingFields.push("joblevel");
    if (!instituteId) missingFields.push("instituteId");
    if (!deadline) missingFields.push("deadline");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        success: false,
        data: null,
      });
    }

    const filePath = `/uploads/assets/internship/${req.file.filename}`;

    const newInternship = new Internship({
      instituteId,
      image: filePath,
      title,
      location,
      description,
      type,
      education,
      stipend,
      joblevel,
      deadline,
      active: true, // Explicitly set active to true on creation
    });

    await newInternship.save();

    const count = await Internship.countDocuments({ _id: instituteId });

    res.status(201).json({
      message: "Internship posted successfully",
      success: true,
      data: {
        internship: newInternship,
        count,
      },
    });
  } catch (error) {
    console.error("Error adding internship:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
      data: null,
    });
  }
};

// ✏️ PUT: Edit internship
exports.editInternship = async (req, res) => {
  try {
    const { id } = req.params; // Internship ID from URL params
    const updates = req.body;

    // Find the internship by ID and ensure it's active
    const internship = await Internship.findOne({ _id: id, active: true });
    if (!internship) {
      return res.status(404).json({
        message: "Internship not found or inactive",
        success: false,
        data: null,
      });
    }

    // Apply updates only if provided
    if (updates.title) internship.title = updates.title;
    if (updates.location) internship.location = updates.location;
    if (updates.description) internship.description = updates.description;
    if (updates.type) internship.type = updates.type;
    if (updates.education) internship.education = updates.education;
    if (updates.stipend) internship.stipend = updates.stipend;
    if (updates.joblevel) internship.joblevel = updates.joblevel;
    if (updates.deadline) internship.deadline = updates.deadline;

    await internship.save();

    res.status(200).json({
      message: "Internship updated successfully",
      success: true,
      data: internship,
    });
  } catch (error) {
    console.error("Error editing internship:", error);
    res.status(500).json({
      message: "Server error while updating internship",
      success: false,
      data: null,
    });
  }
};

// ✅ GET: Single internship
exports.getSingleInternship = async (req, res) => {
  try {
    const { iid, sid } = req.params;

    // Fetch internship details
    const internship = await Internship.findOne({ _id: iid }).populate({
      path: "instituteId",
      select: "-password",
    });

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found or inactive",
        success: false,
        data: null,
      });
    }

    let internshipData = internship.toObject();

    // If studentId is provided, check if already applied
    if (sid) {
      const existingApplication = await Application.findOne({
        studentId: sid,
        internshipId: iid,
      });

      internshipData.applied = !!existingApplication;
    } else {
      internshipData.applied = false; // Default when no student ID provided
    }

    res.status(200).json({
      message: "Internship retrieved successfully",
      success: true,
      data: internshipData,
    });
  } catch (error) {
    console.error("Error fetching internship details:", error);
    res.status(500).json({
      message: "Failed to fetch internship",
      success: false,
      data: null,
    });
  }
};

// ✅ GET: All internships (with optional limit)
exports.getAllSimpleInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ active: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Internships retrieved successfully",
      success: true,
      data: internships,
    });
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.status(500).json({
      message: "Failed to fetch internships",
      success: false,
      data: null,
    });
  }
};

exports.getInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ active: true })
      .populate({
        path: "instituteId",
        select: "-password",
      })
      .sort({ createdAt: -1 });

    console.log(
      "Raw instituteIds:",
      internships.map((i) => i.instituteId)
    );

    res.status(200).json({
      message: "Internships retrieved successfully",
      success: true,
      data: internships,
    });
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.status(500).json({
      message: "Failed to fetch internships",
      success: false,
      data: null,
    });
  }
};

// 📥 GET internships for a specific institute
exports.getInternshipsByInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;

    const internships = await Internship.find({ instituteId, active: true })
      .sort({ createdAt: -1 })
      .lean();

    const internshipIds = internships.map((i) => i._id);

    const applications = await Application.find({
      internshipId: { $in: internshipIds },
    })
      .populate("studentId", "name email phone bio")
      .lean();

    const internshipsWithApplicants = internships.map((internship) => ({
      ...internship,
      applicants: applications.filter(
        (app) => String(app.internshipId) === String(internship._id)
      ),
    }));

    res.status(200).json({
      message: "Institute internships with applicants retrieved successfully",
      success: true,
      data: {
        count: internshipsWithApplicants.length,
        internships: internshipsWithApplicants,
      },
    });
  } catch (error) {
    console.error("Error fetching internships by institute:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
      data: null,
    });
  }
};

// 🗑 DELETE: Internship by ID (soft delete)
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      {
        $set: { active: false },
      },
      { new: true }
    ); // Return the updated document

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
        success: false,
        data: null,
      });
    }

    const count = await Internship.countDocuments({ active: true });

    res.status(200).json({
      message: "Internship deleted successfully",
      success: true,
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting internship",
      success: false,
      data: null,
    });
  }
};

// 🔢 Count internships
exports.countInternships = async (req, res) => {
  try {
    const count = await Internship.countDocuments({ active: true });

    res.status(200).json({
      message: "Internships count retrieved successfully",
      success: true,
      data: { count },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to count internships",
      success: false,
      data: null,
    });
  }
};

// ✅ Debug route
exports.checkInternships = async (req, res) => {
  try {
    const data = await Internship.find({ active: true });

    res.status(200).json({
      message: "Internships data retrieved successfully",
      success: true,
      data: {
        total: data.length,
        internships: data,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve internships data",
      success: false,
      data: null,
    });
  }
};

// 📅 Active internships this month
exports.getActiveMonthInternships = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const activeInternships = await Internship.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      active: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Active month internships retrieved successfully",
      success: true,
      data: activeInternships,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch active internships",
      success: false,
      data: null,
    });
  }
};

// Search internship by title or location or type
exports.searchInternship = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Please provide a search query",
        success: false,
        data: null,
      });
    }

    const internships = await Internship.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { type: { $regex: query, $options: "i" } },
      ],
      active: true,
    });

    res.status(200).json({
      message: "Search results retrieved successfully",
      success: true,
      data: {
        count: internships.length,
        internships,
      },
    });
  } catch (err) {
    console.error("Error searching internships:", err);
    res.status(500).json({
      message: "Server error while searching internships",
      success: false,
      data: null,
    });
  }
};

exports.applyInternship = async (req, res) => {
  try {
    const { sid, iid } = req.params;
    if (!sid || !iid) {
      return res.status(400).json({
        message: "Student ID, internship ID required",
        success: false,
        data: null,
      });
    }

    const student = await Student.findById(sid);
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        success: false,
        data: null,
      });
    }

    const internship = await Internship.findOne({ _id: iid });
    if (!internship) {
      return res.status(404).json({
        message: "Internship not found or inactive",
        success: false,
        data: null,
      });
    }

    const existingApplication = await Application.findOne({
      studentId: sid,
      internshipId: iid,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "Student has already applied for this internship",
        success: false,
        data: null,
      });
    }

    const application = new Application({
      studentId: sid,
      internshipId: iid,
    });

    await application.save();
    await student.save();

    res.status(201).json({
      message: "Application submitted successfully",
      success: true,
      data: {
        applicationId: application._id,
        studentId: student._id,
        internshipId: internship._id,
      },
    });
  } catch (err) {
    console.error("Error applying for internship:", err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      data: null,
    });
  }
};

// Get all internships applied by a student
exports.getAppliedInternships = async (req, res) => {
  try {
    const { studentId } = req.params;

    const applications = await Application.find({ studentId })
      .populate({
        path: "internshipId",
        select: "title instituteId type location deadline",
        match: { active: true }, // Filter out inactive internships
        populate: { path: "instituteId", select: "name" },
      })
      .select("internshipId appliedAt");

    // Filter out applications where internshipId is null (due to match)
    const validApplications = applications.filter((app) => app.internshipId);

    if (!validApplications.length) {
      return res.status(404).json({
        message: "No internships applied by this student",
        success: false,
        data: null,
      });
    }

    res.status(200).json({
      message: "Applied internships retrieved successfully",
      success: true,
      data: validApplications,
    });
  } catch (err) {
    console.error("Error fetching applied internships:", err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      data: null,
    });
  }
};

// Get all students who applied for a specific internship

exports.getInternshipApplicants = async (req, res) => {
  try {
    const { instituteId } = req.params;

    // Fetch all internships for the given institute
    const internships = await Internship.find({ instituteId })
      .populate({
        path: "instituteId",
        select: "name email",
      })
      .lean(); // Convert to plain JavaScript objects for easier manipulation

    if (!internships || internships.length === 0) {
      return res.status(404).json({
        message: "No active internships found for this institute",
        success: false,
        data: [],
      });
    }

    // Fetch applications for all internships
    const internshipIds = internships.map((internship) => internship._id);
    const applications = await Application.find({
      internshipId: { $in: internshipIds },
    })
      .populate({
        path: "studentId",
        select: "name email resume",
      })
      .select("internshipId studentId resume appliedAt")
      .lean();

    // Map applications to their respective internships
    const internshipsWithApplicants = internships.map((internship) => ({
      ...internship,
      applicants: applications.filter(
        (app) => app.internshipId.toString() === internship._id.toString()
      ),
    }));

    res.status(200).json({
      message: "Internships and applicants retrieved successfully",
      success: true,
      data: internshipsWithApplicants,
    });
  } catch (err) {
    console.error("Error fetching internships and applicants:", err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      data: [],
    });
  }
};

// 📥 GET: All internships applied by a student
exports.getStudentAppliedInternships = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const applications = await Application.find({ studentId })
      .populate({
        path: "internshipId",
        select:
          "title instituteId type location deadline image description stipend joblevel education",
        match: { active: true }, // Filter out inactive internships
        populate: {
          path: "instituteId",
          select: "name",
        },
      })
      .select("internshipId appliedAt resume")
      .sort({ appliedAt: -1 });

    const validApplications = applications.filter((app) => app.internshipId);

    if (!validApplications.length) {
      return res
        .status(404)
        .json({ message: "No internships applied by this student" });
    }

    const appliedInternships = validApplications.map((app) => ({
      internshipId: app.internshipId._id,
      title: app.internshipId.title,
      institute: app.internshipId.instituteId.name,
      type: app.internshipId.type,
      location: app.internshipId.location,
      deadline: app.internshipId.deadline,
      image: app.internshipId.image,
      description: app.internshipId.description,
      stipend: app.internshipId.stipend,
      joblevel: app.internshipId.joblevel,
      education: app.internshipId.education,
      appliedAt: app.appliedAt,
      resume: app.resume,
    }));

    res.status(200).json({
      message: "Applied internships retrieved successfully",
      count: appliedInternships.length,
      internships: appliedInternships,
    });
  } catch (err) {
    console.error("Error fetching student applied internships:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
