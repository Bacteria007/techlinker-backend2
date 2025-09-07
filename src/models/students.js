const mongoose = require("mongoose");
const { userType } = require("../utils/constats");
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [3, "Name must be atleast 3 character long"],
    },
    email: {
      type: String,
      required: "Email is required",
      match: /.+\@.+\..+/,
      unique: true,
    },
    image: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    resume: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: userType.STUDENT,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
    { timestamps: true }
);

module.exports = mongoose.model("students", studentSchema);
