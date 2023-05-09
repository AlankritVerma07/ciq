const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  url: String,
  logo: String,
  merchant: String,
  category: String,
  type: String,
  payout: String,
  status: String,
});
const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
