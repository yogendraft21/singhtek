const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  withdrawal_id: String,
  customer_code: String,
  customer_name: String,
  debit_account_no: String,
  product_code: {
    type:String,
    enum:['RTGS','NEFT','DCR',''],
    default:''
  },
  dealer_code: String,
  beneficiary_name: String,
  credit_account_no: String,
  beneficiary_branch_code:{
    type:String,
    enum:['SBINR120',''],
    default:''
  },
  amount: Number,
  remarks: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  bank_status: {
    type: String,
    enum: ['Allow', 'Pending', 'Cancel','Hold','Inprogress'],
    default: 'Pending'
  },
  utr_number: {
    type:String,
    default:""
  },
  transaction_id:{
    type:String,
    default:''
  },
  userID: String,
  merchantID: String,
  subAdminID:String,
  merchant_status: {
    type: String,
    enum: ['Allow', 'Pending', 'Cancel'],
    default: 'Pending'
  }
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
