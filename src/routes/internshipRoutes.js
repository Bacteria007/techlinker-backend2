const express = require("express");
const router = express.Router();
const {
  addInternship,
  checkInternships,
  countInternships,
  deleteInternship,
  getActiveMonthInternships,
  getInternships,
  searchInternship,
  getInternshipsByInstitute,getSingleInternship,
  applyInternship,
  getInternshipApplicants,
  getStudentAppliedInternships,
  getAllSimpleInternships,
  editInternship,
} = require("../controllers/internship-controllers/internshipController");
const { internshipImageMW, resumePdfMW } = require("../middlewares/profile");

// ✅ GET All internships
router.get("/", getAllSimpleInternships);
router.get("/all", getInternships);
// 📬 POST
router.post("/add", internshipImageMW, addInternship);
router.get("/details/:id", getSingleInternship);
// ✅ GET All internships of a specific institue
router.get(
  "/institute/:instituteId",
  getInternshipsByInstitute
);
router.get("/search", searchInternship);
router.post("/apply/:sid/:iid", applyInternship);
router.get("/institute/:internshipId/applicants", getInternshipApplicants);
router.get("/student/:studentId/applied-internships", getStudentAppliedInternships);

//Edit
router.put('/:id', editInternship);
// 🗑 DELETE
router.delete("/:id", deleteInternship);

// 🔢 Count
router.get("/count", countInternships);

// ✅ Debug
router.get("/check", checkInternships);

// 📅 Active this month
router.get("/active-month", getActiveMonthInternships);


module.exports = router;
