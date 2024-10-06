const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email, passwordHash: password });
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
    // console.log(user)
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    // console.log(isMatch)

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log(token)
    res.status(200).json({ name: user.name, email: user.email, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
