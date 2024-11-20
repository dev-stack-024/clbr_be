const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User({
      name,
      email,
      passwordHash: password,
      role,
      otp: otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes validity
    });

    await user.save();

    // Send email with OTP
    const emailData = {
      to: email,
      subject: '🔒 Your Registration OTP',
      text: `Hi there,\n\nYour OTP for registration is: ${otp}\n\nUse this OTP to complete your registration. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Registration OTP</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hi there,</p>
            <p>We received a request to register your account. Use the following OTP to complete your registration:</p>
            <div style="text-align: center; margin: 20px 0;">
              <p style="font-size: 24px; font-weight: bold; color: #4CAF50; margin: 0;">${otp}</p>
            </div>
            <p style="color: #555;">If you did not request this, please ignore this email.</p>
            <p style="font-size: 12px; color: #777;">Thank you for using our platform!</p>
          </div>
        </div>
      `
    };

    await sendEmail(emailData);

    res.status(201).json({
      message: "User registered successfully",
      otp: otp,
      email: email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    return res.status(500).json({ error: err.message });
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


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity
    await user.save();

    // Send email with OTP
    const emailData = {
      to: email,
      subject: '🔑 Password Reset OTP',
      text: `Hi there,\n\nYour OTP for resetting your password is: ${otp}\n\nThis OTP will expire in 10 minutes. If you did not request this, please ignore this email or contact our support team.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #FF5722; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Password Reset OTP</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hi there,</p>
            <p>You requested to reset your password. Use the following OTP to proceed:</p>
            <div style="text-align: center; margin: 20px 0;">
              <p style="font-size: 24px; font-weight: bold; color: #FF5722; margin: 0;">${otp}</p>
            </div>
            <p style="color: #555;">This OTP will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
            <p style="font-size: 12px; color: #777;">Thank you for using our platform!</p>
          </div>
          <div style="background-color: #f9f9f9; text-align: center; padding: 10px; font-size: 12px; color: #777;">
            <p style="margin: 0;">If you have any questions, feel free to reach out to us at <a href="mailto:support@yourapp.com" style="color: #FF5722; text-decoration: none;">support@yourapp.com</a>.</p>
          </div>
        </div>
      `
    };

    await sendEmail(emailData);

    res.status(200).json({
      message: "Password reset OTP sent",
      otp: otp,
      email: email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpiry: { $gt: Date.now() }
    });


    if (!user) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          passwordHash: hashedPassword,
          resetPasswordOTP: null,
          resetPasswordOTPExpiry: null
        }
      },
      { new: true }
    );

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
