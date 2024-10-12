// src/controllers/uploadController.js
const path = require('path');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate the URL to access the image
    const imageUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;

    return res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl // Return the image URL
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};
