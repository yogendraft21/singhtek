const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  singhtek_id: mongoose.Schema.Types.ObjectId,
  email: String,
  customer_name: String,
  debit_account_no: String,
  product_code: String,
  dealer_code: String,
  beneficiary_code: String,
  credit_account_no: String,
  amount: Number,
  remarks: String,
  docs: String,
  password:String,
  status:{
    type:String,
    enum:['allow','cancel','pending'],
    default:'pending'
  }
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
