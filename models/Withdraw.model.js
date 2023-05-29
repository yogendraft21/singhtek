const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  withdrawal_id: String,
  customer_code: String,
  customer_name: String,
  debit_account_no: String,
  product_code: String,
  dealer_code: String,
  beneficiary_name: String,
  credit_account_no: String,
  beneficiary_branch_code: String,
  amount: Number,
  remarks: String,
  bank_status: {
    type: String,
    enum: ['allow', 'pending', 'cancel'],
    default: 'pending'
  },
  utr_number: String,
  commmission_amount: Number,
  maker: String,
  authorizer: String,
  creation_date: Date,
  success_date: Date,
  userId: String,
  merchantID: String,
  userID:String,
  merchant_status: {
    type: String,
    enum: ['allow', 'pending', 'cancel'],
    default: 'pending'
  }
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
