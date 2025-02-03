import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String, // full name
    required: true,
    lowercase: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String, // cipher text
    required: [true, "Password is required"],
  },
  phoneNumber: {
    type: [String],
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  subjects: [String],
  qualification: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: Date,
    required: true,
  },
  role: {
    type: String,
    default: "Teacher"
  },
  refreshToken: {
    type: String // jwt-session token
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({
    _id: this._id,
    email: this.email,
    fullName: this.fullName,
  }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({
    _id: this._id,
  }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
}

export const User = mongoose.model("User", userSchema);