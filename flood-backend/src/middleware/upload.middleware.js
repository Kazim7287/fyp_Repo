
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================================================
// UPLOAD DIRECTORY
// =========================================================

const uploadDirectory = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "blogs"
);

// =========================================================
// CREATE DIRECTORY IF IT DOES NOT EXIST
// =========================================================

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =========================================================
// STORAGE CONFIGURATION
// =========================================================

const storage = multer.diskStorage({
  // -------------------------------------------------------
  // Destination
  // -------------------------------------------------------

  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  // -------------------------------------------------------
  // Filename
  // -------------------------------------------------------

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const prefix =
      file.fieldname === "contentImage"
        ? "content"
        : "blog";

    const uniqueName = `${prefix}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, uniqueName);
  },
});

// =========================================================
// FILE FILTER
// =========================================================

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPEG, PNG, WEBP, and GIF images are allowed."
    ),
    false
  );
};

// =========================================================
// FEATURED IMAGE UPLOAD
// =========================================================

const uploadBlogImage = multer({
  storage,
  fileFilter,

  limits: {
    // 5 MB
    fileSize: 5 * 1024 * 1024,

    // Featured image = one file
    files: 1,
  },
});

// =========================================================
// CONTENT IMAGE UPLOAD
// =========================================================

const uploadBlogContentImage = multer({
  storage,
  fileFilter,

  limits: {
    // 5 MB per image
    fileSize: 5 * 1024 * 1024,

    // One image per editor upload request
    files: 1,
  },
});

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  uploadBlogImage,
  uploadBlogContentImage,
  uploadDirectory,
};
