const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  Primary: String,
  Main: String,
  SubCategory1: String,
  SubCategory2: String,
});

const Interests = mongoose.model('Interests', interestSchema);
module.exports = Interests;
