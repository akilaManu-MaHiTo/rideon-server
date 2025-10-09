const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    role:{
      type: String,
      enum: ['Admin', 'User'],
      default: 'user'
    },
    rc: { 
      type: Number, 
      default: 0 
    },
    userName: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
