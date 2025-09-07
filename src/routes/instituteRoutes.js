const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  changePassword,
  getProfile,
  updateProfile,
  deleteInstitute,
} = require("../controllers/institute-controllers/institueController");


router.post("/signup", signup);
router.post("/login", login);
router.get("/:id", getProfile);
router.put("/update-profile/:id", updateProfile);
router.post("/change-password/:id", changePassword);
router.delete("/:id", deleteInstitute);

module.exports = router;
