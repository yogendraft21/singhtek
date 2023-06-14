const mongoose = require('mongoose');
const { Schema } = mongoose;

const businessDetailSchema = new Schema({
  merchant_name: String,
  business_name: String,
  business_type: String,
  business_category: String,
  business_sub_category: String,
  company_expenditure: String,
  website: String,
  bank_name: String,
  bank_account_number: String,
  bank_ifsc_code: String,
  gst: String,
  pan_number: String,
  aadhar_number: String,
});

const businessAddressSchema = new Schema({
  address: String,
  pincode: String,
  city: String,
  state: String,
  country: String,
});

const kycDocumentsSchema = new Schema({
  company_pan_card: String,
  company_gst: String,
  bank_statement: String,
});

const merchantSchema = new Schema({
  singhtek_id: {
    type: Schema.Types.ObjectId,
    ref: 'SinghtekUser',
  },
  user_name: {
    type:String,
    unique:true
  },
  email: String,
  mobile: String,
  password: String,
  transaction_limit: Number,
  amount:Number,
  business_detail: businessDetailSchema,
  business_address: businessAddressSchema,
  kyc_documents: kycDocumentsSchema,
  status: {
    type: String,
    enum: ['Allow', 'Cancel', 'Pending'],
    default: 'Pending',
  },
  user_type:String
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
