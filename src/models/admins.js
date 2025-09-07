// models/Admin.js

const mongoose = require("mongoose");
const { userType } = require("../utils/constats");

const adminSchema = new mongoose.Schema({
  // name: {
  //   type: String,
  //   required: true,
  // },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: userType.ADMIN,
  },
});

module.exports = mongoose.model("admins", adminSchema);
