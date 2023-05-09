//schema for dummy users in final screen//
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User Must Have A Name'],
  },
});

const dummyUser = mongoose.model('dummyUser', userSchema);
module.exports = dummyUser;
