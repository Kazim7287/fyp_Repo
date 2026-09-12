const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================================================
// BASE UPLOAD DIRECTORY
// =========================================================

const uploadsDirectory = path.join(
  __dirname,
  "..",
  "..",
  "uploads"
);

// =========================================================
// BLOG UPLOAD DIRECTORY
// =========================================================

const blogUploadDirectory = path.join(
  uploadsDirectory,
  "blogs"
);

// =========================================================
// RESEARCH UPLOAD DIRECTORIES
// =========================================================

const researchUploadDirectory = path.join(
  uploadsDirectory,
  "research"
);

const researchImageDirectory = path.join(
  researchUploadDirectory,
  "images"
);

const researchPdfDirectory = path.join(
  researchUploadDirectory,
  "pdfs"
);

// =========================================================
// CREATE ALL DIRECTORIES
// =========================================================

[
  uploadsDirectory,
  blogUploadDirectory,
  researchUploadDirectory,
  researchImageDirectory,
  researchPdfDirectory,
].forEach((directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });
  }
});

// =========================================================
// BLOG STORAGE
// =========================================================

const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, blogUploadDirectory);
  },

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
// BLOG IMAGE FILTER
// =========================================================

const blogImageFilter = (req, file, cb) => {
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
// BLOG FEATURED IMAGE UPLOAD
// =========================================================

const uploadBlogImage = multer({
  storage: blogStorage,

  fileFilter: blogImageFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

// =========================================================
// BLOG CONTENT IMAGE UPLOAD
// =========================================================

const uploadBlogContentImage = multer({
  storage: blogStorage,

  fileFilter: blogImageFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

// =========================================================
// RESEARCH IMAGE STORAGE
// =========================================================

const researchImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, researchImageDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName = `research-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, uniqueName);
  },
});

// =========================================================
// RESEARCH PDF STORAGE
// =========================================================

const researchPdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, researchPdfDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName = `research-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.pdf`;

    cb(null, uniqueName);
  },
});

// =========================================================
// RESEARCH IMAGE FILTER
// =========================================================

const researchImageFilter = (req, file, cb) => {
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
// RESEARCH PDF FILTER
// =========================================================

const researchPdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only PDF documents are allowed."
    ),
    false
  );
};

// =========================================================
// RESEARCH IMAGE UPLOAD
// =========================================================

const uploadResearchImage = multer({
  storage: researchImageStorage,

  fileFilter: researchImageFilter,

  limits: {
    // 5 MB
    fileSize: 5 * 1024 * 1024,

    // One research image
    files: 1,
  },
});

// =========================================================
// RESEARCH PDF UPLOAD
// =========================================================

const uploadResearchPdf = multer({
  storage: researchPdfStorage,

  fileFilter: researchPdfFilter,

  limits: {
    // 20 MB
    fileSize: 20 * 1024 * 1024,

    // One research PDF
    files: 1,
  },
});

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  // -------------------------------------------------------
  // Existing Blog Middleware
  // -------------------------------------------------------

  uploadBlogImage,
  uploadBlogContentImage,

  // -------------------------------------------------------
  // Research Middleware
  // -------------------------------------------------------

  uploadResearchImage,
  uploadResearchPdf,

  // -------------------------------------------------------
  // Directories
  // -------------------------------------------------------

  uploadsDirectory,
  blogUploadDirectory,

  researchUploadDirectory,
  researchImageDirectory,
  researchPdfDirectory,
};