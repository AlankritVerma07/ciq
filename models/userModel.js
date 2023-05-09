const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    unique: true,
    required: [true, 'User Must Have A firebaseId'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'User Must Have An Email-Address'],
    validate: [validator.isEmail, 'Please provide a valid email Address'],
  },
  userName: {
    type: String,
    required: [true, 'User Must Have A Name'],
  },
  fName: {
    type: String,
    required: [true, 'User Must Have A First Name'],
  },
  lName: {
    type: String,
    required: [true, 'User Must Have A Last Name'],
  },
  dob: {
    type: String,
    required: [true, 'User Must enter A Dob'],
  },
  gender: {
    type: String,
    default: 'Male',
    enum: {
      values: ['Male', 'Female', 'Transgender'],
      message: 'Gender can either be of 3 values',
    },
  },
  mobile: {
    type: Number,
    required: [true, 'User Must enter A mobile no.'],
  },
  pinCode: {
    type: Number,
    required: [true, 'User Must enter A pincode.'],
    validate: {
      validator: function (el) {
        const pattern = /^[1-9]{1}[0-9]{5}$/;
        return pattern.test(el);
      },
      message: `Enter a valid pincode.PIN code cannot start from zero, can Enter only 6 digits, enter 6 consecutive digits`,
    },
  },
  bio: {
    type: String,
    trim: true,
  },
  referralCode: {
    type: String,
  },
  profileVisibility: {
    type: String,
    default: 'Public',
    enum: {
      values: ['Public', 'Friends', 'Private'],
      message: 'Profile Visibility can either be of 3 values',
    },
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  interests: [String],
  totalCashback: {
    type: Number,
    default: 0,
  },
  myBookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  blocked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  muted: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  location: {
    type: { type: String },
    coordinates: [],
  },
  // blockedBy: [String],
  // blocking: [String],
  // mutedBy: [String],
  // muting: [String],
  postAction: [String],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  commentAction: [String],
  orders: [String],
  userImage: String,
  profileUrl: {
    type: String,
  },
});

userSchema.index({ userName: 1 });
userSchema.index({ loction: '2dsphere' });

const User = mongoose.model('User', userSchema);
module.exports = User;
