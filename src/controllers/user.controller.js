import {User} from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const generateAccessOrRefreshTokenToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    return {accessToken, refreshToken};
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, phoneNumber, department, subjects, qualification, joiningDate, role } = req.body;
  // Regular expressions for validation
  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const departmentRegex = /^[A-Za-z0-9 ]+$/;
  const qualificationRegex = /^[A-Za-z0-9 ]+$/;
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4})$/;
  const currentYear = new Date().getFullYear();
  const validRoles = ["teacher"];
  const validSubjects = ["Math", "Science", "History", "English", "Data Structures", "Algorithms", "Operating Systems"];

  // Validation checks
  if (!nameRegex.test(fullName)) throw new ApiError(400, "Invalid full name format");
  if (!emailRegex.test(email)) throw new ApiError(400,"Invalid email format");
  if (!password) throw new ApiError(400,"Invalid password");
  if (!phoneRegex.test(phoneNumber)) throw new ApiError(400,"Invalid phone number format");
  if (!departmentRegex.test(department)) throw new ApiError(400,"Invalid department format");
  if (!qualificationRegex.test(qualification)) throw new ApiError(400,"Invalid qualification format");
  if (!validRoles.includes(role)) throw new ApiError(400,"Invalid role");
  if (!subjects.every(subject => validSubjects.includes(subject))) throw new ApiError(400,"Invalid subjects");
  const isValidDate = (dateStr) => {
    const dateParts = dateStr.split("-");
    if (dateParts.length !== 3) return false;

    const [day, month, year] = dateParts.map(Number);
    const dateObject = new Date(year, month - 1, day);

    return (
      dateObject.getFullYear() === year &&
      dateObject.getMonth() === month - 1 &&
      dateObject.getDate() === day
    );
  };

  if (!isValidDate(joiningDate)) throw new ApiError(400, "Invalid date format or non-existent date (dd-mm-yyyy)");

  const year = parseInt(joiningDate.split("-")[2]);
  if (year !== currentYear && year !== currentYear - 1) throw new ApiError(400,"Joining year must be current or previous year");

  const user = await User.create({
    fullName : fullName,
    email : email,
    password: password,
    phoneNumber : phoneNumber,
    department : department,
    subjects : subjects,
    qualification : qualification,
    joiningDate : joiningDate,
    role : role,
  });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user");
  return res.status(201).json(new ApiResponse(200, createdUser, "User successfully registered"));
});

const loginUser = asyncHandler(async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) throw new ApiError(400, "Email and Password field is required");

  const user = await User.findOne({email});
  if (!user) throw new ApiError(401, "User does not exist");
  const validUser = await user.comparePassword(password);
  if (!validUser) throw new ApiError(401, "Wrong username or password");

  const loggedInUser = await User.findById(user._id).select("-password");
  const {accessToken, refreshToken} = generateAccessToken(loggedInUser._id);
  return res.status(200)
    .cookie("accessToken", accessToken, { httpOnly: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true })
    .json(new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "User successfully logged in"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {$unset: {refreshToken: 1}}, {new: true});
  return res.status(200)
    .clearCookie("accessToken", { httpOnly: true })
    .clearCookie("refreshToken", { httpOnly: true })
    .json(new ApiResponse(200, {}, "User successfully logged out"));
});

const forgotPassword = asyncHandler( async (req, res) => {
  const {email} = req.body;
  const user = await User.findOne({email});
  if (!user) throw new ApiError(401, "User not found");

  const resetToken = jwt.sign({id: user._id, resetToken: true}, process.env.JWT_SECRET, {expiresIn: "10m"});
  const resetLink = `${req.protocol}://${req.get('host')}/forgot-password/${resetToken}`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {user: process.env.EMAIL, pass: process.env.EMAIL_PASS},
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset",
    text: `Click here to reset your password: ${resetLink}`
  });
  return res.status(200).json(new ApiResponse(200, {}, "Password reset link sent"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const {token} = req.params;
  const {newPassword} = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) throw new ApiError(401, "Invalid or expired token");

  await User.findByIdAndUpdate(decoded.id, {password: newPassword});
  return res.status(200).json(new ApiResponse(200, {}, "Password update successfully"));
});

export {registerUser, loginUser, logoutUser, forgotPassword, resetPassword};