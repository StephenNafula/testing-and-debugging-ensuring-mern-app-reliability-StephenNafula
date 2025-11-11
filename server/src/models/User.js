// server/src/models/User.js
// Mongoose User model (simplified for testing)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving (simplified for testing)
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  // In production, use bcryptjs for real password hashing
  this.password = `hashed_${this.password}`;
  return next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
