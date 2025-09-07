const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "internships",
      required: true,
    },
    resume: {
      type: String,
      
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("applications", applicationSchema);