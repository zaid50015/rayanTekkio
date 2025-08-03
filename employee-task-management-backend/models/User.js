const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const moduleScoreSchema = new mongoose.Schema({
  module_id: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['employee', 'manager'],
    default: 'employee'
  },
  modules_scores: [moduleScoreSchema],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to initialize modules_scores for new users
userSchema.pre('save', function(next) {
  if (this.isNew && (!this.modules_scores || this.modules_scores.length === 0)) {
    this.modules_scores = [];
    for (let i = 1; i <= 10; i++) {
      this.modules_scores.push({ module_id: i, score: 0 });
    }
  }
  this.updated_at = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);

