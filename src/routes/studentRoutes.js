// create authRoutes
const express = require("express");
const {
  signup,
  login,
  resetPassword,
  verifyOtpAndResetPassword,
  getStudentProfile,
  updateStudentProfile,
  deleteStudent,
} = require("../controllers/student-controllers/studentController");
const { resumePdfMW, studentAvatarMW } = require("../middlewares/profile");
const {
  getAppliedInternships,
} = require("../controllers/internship-controllers/internshipController");
const router = express.Router();

// =================== START =====================

// auth
router.post("/signup",  signup);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtpAndResetPassword);
// internship
router.get("/:studentId/applied-internships", getAppliedInternships);
// profile
router.get("/profile/:id", getStudentProfile);
router.put("/update-profile/:id", resumePdfMW, updateStudentProfile);
router.delete("/:id", deleteStudent);

//==================== END ========================

module.exports = router;
