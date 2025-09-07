const express = require("express");
const router = express.Router();
const { login, getDashboardStats, getRecentStudents, getActiveInternships, getPartnerInstitutes, getRecentActivity, getAllStudents, getAllinstitutes } = require("../controllers/admin-controllers/adminController");

// Admin Login
router.post("/login", login);
// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-students', getRecentStudents);
router.get('/dashboard/active-internships', getActiveInternships);
router.get('/dashboard/partner-institutes', getPartnerInstitutes);
router.get('/dashboard/recent-activity', getRecentActivity);
router.get('/all-students', getAllStudents);
router.get('/all-institutes', getAllinstitutes);

module.exports = router;
