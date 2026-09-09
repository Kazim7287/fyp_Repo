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
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}


// =========================================================
// STORAGE CONFIGURATION
// =========================================================

const storage = multer.diskStorage({

  // -------------------------------------------------------
  // Destination
  // -------------------------------------------------------

  destination: (req, file, cb) => {
    cb(
      null,
      uploadDirectory
    );
  },

  // -------------------------------------------------------
  // Filename
  // -------------------------------------------------------

  filename: (req, file, cb) => {

    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    const uniqueName =
      `blog-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(
      null,
      uniqueName
    );
  },
});


// =========================================================
// FILE FILTER
// =========================================================

const fileFilter = (
  req,
  file,
  cb
) => {

  // -------------------------------------------------------
  // Allowed MIME types
  // -------------------------------------------------------

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  // -------------------------------------------------------
  // Check MIME type
  // -------------------------------------------------------

  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return cb(
      null,
      true
    );
  }

  // -------------------------------------------------------
  // Reject unsupported file
  // -------------------------------------------------------

  return cb(
    new Error(
      "Only JPEG, PNG, WEBP, and GIF images are allowed."
    ),
    false
  );
};


// =========================================================
// MULTER INSTANCE
// =========================================================

const uploadBlogImage =
  multer({
    storage,

    fileFilter,

    limits: {
      // 5 MB
      fileSize:
        5 * 1024 * 1024,

      files: 1,
    },
  });


// =========================================================
// EXPORT
// =========================================================

module.exports = {
  uploadBlogImage,
  uploadDirectory,
};