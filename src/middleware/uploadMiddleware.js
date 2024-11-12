// src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the directory exists, if not, create it
const ensureDirectoryExistence = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }
};

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    let uploadPath = 'uploads/images'

    // Ensure the folder exists
    ensureDirectoryExistence(uploadPath);

    cb(null, uploadPath); // Save images in the appropriate folder
  },
  filename: (req, file, cb) => {
    // Create a unique filename with the current timestamp
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'));
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // Limit file size to 1 MB
});

module.exports = upload;
