const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  merchant_id: mongoose.Schema.Types.ObjectId,
  email:String,
  sr_number: String,
  beneficiary_name: String,
  credit_account_no: String,
  beneficiary_branch_code: String,
  amount: Number,
  remarks: String,
  password:String,
  
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;
