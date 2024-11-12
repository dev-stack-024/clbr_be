const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = new User({ name, email, passwordHash: password, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    return res.status(200).json({ user, token });
  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
};


exports.getProfile = async (req, res) => {
  try {
    // console.log(req)
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateProfile = async (req, res) => {
  const { name, email, phone, gender, profilePictureURL, bio } = req.body;
  try {
    // Update if user exists, otherwise create new
    let user = await User.findById(req.userId);
    if (user) {
      // Update the user's profile fields
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.gender = gender || user.gender;
      user.profilePictureURL = profilePictureURL || user.profilePictureURL;
      user.bio = bio || user.bio;
      // user.badges = badges || user.badges;
      // user.favorites = favorites || user.favorites;
      // user.role = role || user.role;
      await user.save();
      return res.json(user);
    } else {
      // If user doesn't exist, create new
      user = new User({ name, email, phone, gender, profilePictureURL, bio, badges, favorites, role });
      await user.save();
      res.status(201).json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
