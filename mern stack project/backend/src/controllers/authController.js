const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const redisClient = require("../redis");
require("dotenv").config();

const createAccessToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXP || "15m",
  });
const createRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXP || "7d",
  });
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "yoyo72985@gmail.com",
    pass: "qlvkscoggoryuzbg", 
  },
});

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { firstName, lastName, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      profileImage,
      role: "admin",
    });

    const verifyToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1d" }
    );
    const link = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;

    const mailOptions = {
      from: "yoyo72985@gmail.com",
      to: user.email,
      subject: "Verify Your Email Address",
      html: `
    <h3>Email Verification</h3>
    <p>Hello ${firstName},</p>
    <p>Please click the button below to verify your email:</p>
    <p>
      <a href="${link}" 
         style="
           padding: 10px 16px;
           background:#4CAF50;
           color:white;
           text-decoration:none;
           border-radius:6px;">
         Verify Email
      </a>
    </p>
    <p>If the button doesn't work, copy this link:</p>
    <p>${link}</p>
  `,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(201)
      .json({ message: "Registered. Check email to verify." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(404).send("User not found");
    user.isVerified = true;
    await user.save();
    res.send("Email verified. You can close this window and login.");
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid or expired token");
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Invalid credentials" });
    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ ok: false, accessToken: "" });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user || user.refreshToken !== token)
      return res.status(403).json({ ok: false, accessToken: "" });

    const newAccess = createAccessToken(user);
    const newRefresh = createRefreshToken(user);
    user.refreshToken = newRefresh;
    await user.save();
    return res.json({ ok: true, accessToken: newAccess });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ ok: false, accessToken: "" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Not found" });
    return res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(200)
        .json({ message: "If your email exists, a reset link was sent." });

    const token = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "1h",
    });
    const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: "yoyo72985@gmail.com",
      to: user.email,
      subject: "Password Reset Request – Action Required",

      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Password Reset Requested</h2>
      <p>Hello <strong>${user.name || "User"}</strong>,</p>

      <p>We received a request to reset your password for your account associated with this email address.</p>

      <p style="margin: 20px 0;">
        <a href="${link}" 
           style="background: #4CAF50; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px;">
          Reset Your Password
        </a>
      </p>

      <p>If you did not request this, you can safely ignore this email.  
         This link will expire in <strong>1 hour</strong> for security reasons.</p>

      <p>Thanks,<br/>The Support Team</p>

      <hr style="margin: 25px 0; opacity: 0.4;" />

      <small style="color: #666;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <span style="color: #0066cc;">${link}</span>
      </small>
    </div>
  `,
    };
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "If your email exists, a reset link was sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token) return res.status(400).json({ message: "Missing token" });
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();
    return res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid token or request" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, q = "" } = req.query;
    const cacheKey = `users:${page}:${limit}:${q}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const offset = (page - 1) * limit;
    const where = q
      ? { email: { [require("sequelize").Op.like]: `%${q}%` } }
      : {};
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ["id", "firstName", "lastName", "email", "profileImage"],
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
    });

    const result = { total: count, users: rows };
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result)); // cache 60s
    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Not found" });
    const { firstName, lastName, role } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }
    await user.save();
    await redisClient.flushAll();
    return res.json({
      message: "Profile updated",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
