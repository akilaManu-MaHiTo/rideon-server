const multer = require("multer");

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"), false);
  }
};

module.exports = multer({ storage, fileFilter });
