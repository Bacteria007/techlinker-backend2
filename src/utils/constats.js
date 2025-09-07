exports.requiredProps = {
  SIGNUP: ["firstName", "lastName", "username", "email", "password"],
  LOGIN: ["email", "password"],
  RESEND_EMAIL_OTP: ["email"],
  VERIFY_EMAIL_OTP: ["email", "otp"],
  UPDATE_MY_PROFILE_PICTURE: ["image"],
  FORGET_PASSWORD: ["email"],
  VERIFY_FORGET_PASSWORD_OTP: ["email", "otp"],
  RESET_PASSWORD: ["email", "password", "otp"],
};

exports.userType = {
  ADMIN: "admin",
  STUDENT: "student",
  INSTITUE: "institute",
};
