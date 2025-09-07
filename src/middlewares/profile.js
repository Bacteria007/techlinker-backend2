const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📌 Function to create a dynamic upload middleware
function createUploadMiddleware(folderName, allowedMimeTypes, fieldName) {
  // Ensure upload folder exists
  const uploadPath = `./uploads/assets/${folderName}`;
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadPath);
      },
      filename: function (req, file, cb) {
        const now = Date.now();
        cb(null, `${file.fieldname}-${now}${path.extname(file.originalname)}`);
      },
    }),
    fileFilter: function (req, file, cb) {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Only files of type: ${allowedMimeTypes.join(", ")} are allowed!`
          ),
          false
        );
      }
    },
  }).single(fieldName);
}

// 📌 Middlewares
const resumePdfMW = createUploadMiddleware(
  "resumes",
  ["application/pdf"],
  "resume"
);

const internshipImageMW = createUploadMiddleware(
  "internship",
  ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  "image"
);

// const studentAvatarMW = createUploadMiddleware(
//   "profiles/student",
//   ["image/jpeg", "image/png", "image/jpg", "image/webp"],
//   "avatar"
// );
// const institueImageMW = createUploadMiddleware(
//   "profiles/institute",
//   ["image/jpeg", "image/png", "image/jpg", "image/webp"],
//   "image"
// );

module.exports = {
  resumePdfMW,
  internshipImageMW,
  // createUploadMiddleware,
  // institueImageMW,
  // studentAvatarMW,
};
