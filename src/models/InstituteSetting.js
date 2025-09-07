const mongoose = require("mongoose");

const instituteSettingSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  twoStepVerification: { type: Boolean, default: false },
  profileVisibility: { type: Boolean, default: true },
  readReceipts: { type: Boolean, default: true },
  locationAccess: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("instituteSetting", instituteSettingSchema);
