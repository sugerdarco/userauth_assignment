// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// require("dotenv").config();
//
// const app = express();
// app.use(express.json());
//
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
//
// const UserSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   phone: String,
//   department: String,
//   subjects: [String],
//   qualification: String,
//   joiningDate: Date,
//   role: { type: String, default: "Teacher" },
//   resetToken: String,
// });
//
// const User = mongoose.model("User", UserSchema);
//
// // Signup API
// app.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password, phone, department, subjects, qualification, joiningDate } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//
//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       department,
//       subjects,
//       qualification,
//       joiningDate,
//     });
//
//     await user.save();
//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Error signing up" });
//   }
// });
//
// // Login API
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }
//
//     const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ error: "Login failed" });
//   }
// });
//
// // Password Reset Request API
// app.post("/reset-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: "User not found" });
//
//     const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
//     user.resetToken = resetToken;
//     await user.save();
//
//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
//     });
//
//     await transporter.sendMail({
//       to: email,
//       subject: "Password Reset",
//       text: `Reset your password using this token: ${resetToken}`,
//     });
//
//     res.json({ message: "Reset link sent to email" });
//   } catch (error) {
//     res.status(500).json({ error: "Error sending reset email" });
//   }
// });
//
// // Reset Password API
// app.post("/reset-password/:token", async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { newPassword } = req.body;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//
//     const user = await User.findById(decoded.userId);
//     if (!user || user.resetToken !== token) return res.status(401).json({ error: "Invalid token" });
//
//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetToken = null;
//     await user.save();
//
//     res.json({ message: "Password reset successful" });
//   } catch (error) {
//     res.status(500).json({ error: "Error resetting password" });
//   }
// });
//
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
