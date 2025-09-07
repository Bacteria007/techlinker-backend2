const Admin = require("../../models/admins");
const Student = require("../../models/students");
const Internship = require("../../models/internships");
const Institute = require("../../models/institutes");
const Application = require("../../models/applicationModel");

// Login endpoint
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin1234";

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        data: null,
      });
    }

    // Check if credentials match hardcoded values
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null,
      });
    }

    // Check if admin exists in the database
    let admin = await Admin.findOne({ email: ADMIN_EMAIL });

    // If admin doesn't exist, create a new admin
    if (!admin) {
      admin = new Admin({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD, // Store password as plain text
        role: 'admin',
      });
      await admin.save();
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      data: null,
    });
  }
};

// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for dashboard cards
    const studentsCount = await Student.countDocuments();
    const internshipsCount = await Internship.countDocuments();
    const institutesCount = await Institute.countDocuments();

    res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      success: true,
      data: {
        students: studentsCount,
        internships: internshipsCount,
        institutes: institutesCount,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      message: "Server error retrieving dashboard statistics",
      success: false,
      data: null,
    });
  }
};

// Get Recent Students (for dashboard preview)
exports.getRecentStudents = async (req, res) => {
  try {
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select("name email createdAt");

    res.status(200).json({
      message: "Recent students retrieved successfully",
      success: true,
      data: recentStudents,
    });
  } catch (error) {
    console.error("Recent Students Error:", error);
    res.status(500).json({
      message: "Server error retrieving recent students",
      success: false,
      data: null,
    });
  }
};

// Get Active Internships (for dashboard preview)
exports.getActiveInternships = async (req, res) => {
  try {
    const activeInternships = await Internship.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select(
        "title type location description createdAt datePosted joblevel deadline"
      )
      .populate("instituteId", "name");

    res.status(200).json({
      message: "Active internships retrieved successfully",
      success: true,
      data: activeInternships,
    });
  } catch (error) {
    console.error("Active Internships Error:", error);
    res.status(500).json({
      message: "Server error retrieving active internships",
      success: false,
      data: null,
    });
  }
};

exports.getPartnerInstitutes = async (req, res) => {
  try {
    // Fetch partner institutes with limited fields, sorted by creation date
    const partnerInstitutes = await Institute.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select("name address email createdAt")
      .lean(); // Use lean() for better performance

    // Fetch internship count for each institute
    const institutesWithInternshipCount = await Promise.all(
      partnerInstitutes.map(async (institute) => {
        const internshipCount = await Internship.countDocuments({
          instituteId: institute._id,
        });

        return {
          ...institute,
          internshipCount,
        };
      })
    );

    res.status(200).json({
      message:
        "Partner institutes with internship count retrieved successfully",
      success: true,
      data: institutesWithInternshipCount,
    });
  } catch (error) {
    console.error("Partner Institutes Error:", error);
    res.status(500).json({
      message: "Server error retrieving partner institutes",
      success: false,
      data: null,
    });
  }
};

// Get Recent Activity (for dashboard)
exports.getRecentActivity = async (req, res) => {
  try {
    // Get recent students
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name email bio createdAt");

    // Get recent internships
    const recentInternships = await Internship.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title type createdAt")
      .populate("instituteId", "name");

    // Get recent institutes
    const recentInstitutes = await Institute.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name address createdAt");

    // Combine and format activities
    const activities = [
      ...recentStudents.map((student) => ({
        type: "student_registered",
        title: "New student registered",
        subtitle: `${student.name} joined ${student.course || "a course"}`,
        time: student.createdAt,
        icon: "person_add",
        color: "#4CAF50",
      })),
      ...recentInternships.map((internship) => ({
        type: "internship_posted",
        title: "Internship posted",
        subtitle: `${internship.title} at ${
          internship.instituteId?.name || "Unknown Institute"
        }`,
        time: internship.createdAt,
        icon: "work",
        color: "#2196F3",
      })),
      ...recentInstitutes.map((institute) => ({
        type: "institute_verified",
        title: "Institute verified",
        subtitle: `${institute.name} approved`,
        time: institute.createdAt,
        icon: "business",
        color: "#FF9800",
      })),
    ];

    // Sort by time and limit to 5
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, 5);

    res.status(200).json({
      message: "Recent activities retrieved successfully",
      success: true,
      data: recentActivities,
    });
  } catch (error) {
    console.error("Recent Activity Error:", error);
    res.status(500).json({
      message: "Server error retrieving recent activities",
      success: false,
      data: null,
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().lean().exec();

    const studentsWithApplications = await Promise.all(
      students.map(async (student) => {
        const applications = await Application.find({ studentId: student._id })
          .populate({
            path: "internshipId",
            model: "internships",
            populate: {
              path: "instituteId",
              model: "institutes",
            },
          })
          .lean();

        return {
          ...student,
          appliedInternships: applications.map((app) => ({
            internship: app.internshipId,
            appliedAt: app.appliedAt,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Students with applied internships fetched successfully",
      data: studentsWithApplications,
    });
  } catch (error) {
    console.error("Error fetching students with internships:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getAllinstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find();

    res.status(200).json({
      success: true,
      message: "Institutes with applied internships fetched successfully",
      data: institutes,
    });
  } catch (error) {
    console.error("Error fetching Institutes with internships:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
