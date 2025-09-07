const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Student=require("../../models/students");
const { userType } = require("../../utils/constats");
const EMAIL_ID = "aqsa.dev1@gmail.com";
const EMAIL_PASSWORD = "zlor syag wydu szoh";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_ID,
    pass: EMAIL_PASSWORD,
  },
});

// ============== Auth ==============

exports.signup = async (req, res) => {
  try {
    const { email, password, name,phone } = req.body;

   
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        success: false,
        data: null
      });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format",
        success: false,
        data: null
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters",
        success: false,
        data: null
      });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ 
        message: "Email already exists",
        success: false,
        data: null
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      email,
      password: hashedPassword,
      name: name || "",
      phone:phone
    });

    await student.save();

    res.status(201).json({
      message: "Student registered successfully",
      success: true,
      data: {
        id: student._id,
        email: student.email,
        name: student.name,
        role: student.role,
        phone:student.phone
      }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ 
      message: "Internal server error",
      success: false,
      data: null
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        success: false,
        data: null
      });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ 
        message: "User not found",
        success: false,
        data: null
      });
    }

    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        success: false,
        data: null
      });
    }

    res.status(200).json({
      message: "Student logged in successfully",
      success: true,
      data: {
        id: student._id,
        email: student.email,
        name: student.name,
        role:student.role
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      message: "Internal server error",
      success: false,
      data: null
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Email is required",
        success: false,
        data: null
      });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ 
        message: "No Account exists with this email",
        success: false,
        data: null
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 2 * 60 * 1000;

    // Save OTP and expiry to student
    student.resetPasswordToken = otp;
    student.resetPasswordExpires = otpExpiry;
    await student.save();

    // Send email with OTP
    const mailOptions = {
      from: EMAIL_ID,
      to: student.email,
      subject: "TechLinker Password Reset OTP",
      html: `
        <p>You requested a password reset.</p>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 2 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "OTP sent to your email",
      success: true,
      data: null
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ 
      message: "Internal server error",
      success: false,
      data: null
    });
  }
};

exports.verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        message: "Email, OTP, and new password are required",
        success: false,
        data: null
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: "New password must be at least 8 characters",
        success: false,
        data: null
      });
    }

    const studentExists = await Student.findOne({ email });

    if (!studentExists) {
      return res.status(401).json({ 
        message: "No Student found with this email",
        success: false,
        data: null
      });
    }

    const student = await Student.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!student) {
      return res.status(401).json({ 
        message: "Invalid or expired OTP",
        success: false,
        data: null
      });
    }

    // Hash the new password and update student
    student.password = await bcrypt.hash(newPassword, 10);
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;
    await student.save();

    res.status(200).json({ 
      message: "Password reset successfully",
      success: true,
      data: null
    });
  } catch (error) {
    console.error("Verify OTP and Reset Password Error:", error);
    res.status(500).json({ 
      message: "Internal server error",
      success: false,
      data: null
    });
  }
};

// ============== Profile ==============

exports.getStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: "Student ID Missing",
        success: false,
        data: null
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ 
        message: "Student not found",
        success: false,
        data: null
      });
    }

    res.status(200).json({
      message: "Student profile retrieved successfully",
      success: true,
      data: {
        id: student._id,
        email: student.email,
        name: student.name,
        phone: student.phone,
        bio: student.bio,
        resume: student.resume || "",
        avatar:student.avatar
      }
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ 
      message: "Internal server error",
      success: false,
      data: null
    });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, bio } = req.body;

    if (!id) {
      return res.status(400).json({ 
        message: "Student ID Missing",
        success: false,
        data: null
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ 
        message: "Student not found",
        success: false,
        data: null
      });
    }


    // Update text fields
    if (name !== undefined) student.name = name;
    if (email !== undefined) student.email = email;
    if (phone !== undefined) student.phone = phone;
    if (bio !== undefined) student.bio = bio;

    // ✅ Save uploaded resume path
    if (req.file) {
      // Store path with forward slashes for URLs
      student.resume = req.file.path.replace(/\\/g, "/");
    }

    // Email validation
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format",
        success: false,
        data: null
      });
    }

    await student.save();

    res.status(200).json({
      message: "Student profile updated successfully",
      success: true,
      data: {
        id: student._id,
        email: student.email,
        name: student.name,
        phone: student.phone,
        bio: student.bio,
        resume: student.resume || "",
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ 
      message: "Internal server error",
      success: false,
      data: null
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: "Student ID is missing",
        success: false,
        data: null
      });
    }

    // Check if the student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ 
        message: "Student not found",
        success: false,
        data: null
      });
    }

    // Soft delete by setting active to false
    await Student.findByIdAndUpdate(id, { $set: { active: false } });

    res.status(200).json({
      message: "Student deactivated successfully",
      success: true,
      data: null
    });
  } catch (error) {
    console.error("Delete Student Error:", error);
    res.status(500).json({ 
      message: "Internal server error",
      success: false,
      data: null
    });
  }
};
