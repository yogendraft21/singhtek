
const express = require('express');
const SinghTekRoute = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const SinghtekUser = require('../models/SinghTekUsers.model');
const Merchant = require('../models/Merchant.model');
const { auth } = require('../middleware/auth');
const Withdrawal = require('../models/Withdraw.model');
const User = require('../models/Users.model');
const multer = require('multer')
const fs = require('fs');
require('dotenv').config()
SinghTekRoute.get("/", (req, res) => {
  return res.status(200).json("SinghTek Route")
})

SinghTekRoute.post("/register", async (req, res) => {
  try {
    const { username, department, first_name, email, designation, mobile_no, user_type, last_name, password, image, docsFile } = req.body;
    // Check if the username or email already exists
    const existingUser = await SinghtekUser.findOne({ email: email });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new SinghtekUser instance
    const singhtekUser = new SinghtekUser({
      username,
      department,
      first_name,
      email,
      designation,
      mobile_no,
      user_type,
      last_name,
      password: hashedPassword,
      image,
      docsFile,
    });

    // Save the SinghtekUser to the database
    await singhtekUser.save();
    res.status(201).json({ message: 'SinghtekUser signed up successfully' });
  } catch (error) {
    console.error('Error signing up SinghtekUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

SinghTekRoute.post("/login", async (req, res) => {
  // console.log(req.body)
  const { email, password } = req.body;
  try {
    const user = await SinghtekUser.findOne({ email: email })
    console.log(user)
    if (user) {
      // compare hashed password with plain password
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {

          //on success generate token for user
          const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
          return res.status(200).json(token)
        } else {
          return res.status(401).json("check email and password")
        }
      })
    } else {
      return res.status(401).json("User Not found")
    }

  } catch (error) {
    return res.status(401).json({ error: 'error while login singhtek user' })
  }

})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationDir = './tmp/';
    fs.mkdirSync(destinationDir, { recursive: true }); // Create the destination directory if it doesn't exist
    cb(null, destinationDir);
  },
  filename: function (req, file, cb) {
    const date = Date.now().toString();
    const originalname = file.originalname;
    const filename = `${date}-${originalname}`; // Add date and time to the filename
    cb(null, filename);
  },
});

const upload = multer({ storage });

SinghTekRoute.post('/merchant/register', upload.fields([
  
  { name: 'companyPanCard', maxCount: 1 },
  { name: 'companyGST', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
]), auth, async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the merchant already exists
    const existingMerchant = await Merchant.findOne({ email });
    if (existingMerchant) {
      return res.status(401).json('Merchant already exists');
    }

    // Find the corresponding subAdmin user
    const subAdmin = await SinghtekUser.findOne({ _id: req.body.userId });
    if (!subAdmin) {
      return res.status(401).json('SubAdmin not found');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Get file paths from the request
    const companyPanCard = req.files['companyPanCard'][0].path;
    const companyGST = req.files['companyGST'][0].path;
    const bankStatement = req.files['bankStatement'][0].path;

    // Extract data from business_detail
    const businessDetail = JSON.parse(req.body.business_detail);
    const {
      merchant_name,
      business_name,
      business_type,
      business_category,
      business_sub_category,
      company_expenditure,
      website,
      bank_name,
      bank_account_number,
      bank_ifsc_code,
      gst,
      pan_number,
      aadhar_number
    } = businessDetail;

    // Extract data from business_address
    const businessAddress = JSON.parse(req.body.business_address);
    const {
      address,
      pincode,
      city,
      state,
      country
    } = businessAddress;

    // Create a new merchant
    const merchant = new Merchant({
      singhtek_id: subAdmin._id,
      user_name: req.body.user_name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashedPassword,
      transaction_limit: req.body.transaction_limit,
      amount: req.body.amount,
      business_detail: {
        merchant_name,
        business_name,
        business_type,
        business_category,
        business_sub_category,
        company_expenditure,
        website,
        bank_name,
        bank_account_number,
        bank_ifsc_code,
        gst,
        pan_number,
        aadhar_number,
      },
      business_address: {
        address,
        pincode,
        city,
        state,
        country,
      },
      kyc_documents: {
        company_pan_card: companyPanCard,
        company_gst: companyGST,
        bank_statement: bankStatement,
      },
    });

    // Save the merchant to the database
    await merchant.save();

    res.status(200).json({ message: 'Merchant signup successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred during merchant signup' });
  }
});


SinghTekRoute.use(auth);

SinghTekRoute.get("/getWithdrawals", async (req, res) => {

  const id = req.body.userId;
  const data = await Withdrawal.find({ subAdminID: id, merchant_status: 'Allow' });
  console.log(data)
  return res.status(200).json(data)
})

SinghTekRoute.get("/getWithdrawals/:merchantid", async (req, res) => {
  const mid = req.params.merchantid;
  const data = await Withdrawal.find({ subAdminID: req.body.userId, merchantID: mid, merchant_status:'Allow',bank_status:"Pending" });
  // console.log(data)
  return res.status(200).json(data)
})

SinghTekRoute.get("/allWithdrawals", async (req, res) => {
  const id = req.body.userId;
  try {
    const data = await Withdrawal.find({ subAdminID: id, merchant_status: 'Allow',bank_status:"Pending" });
    // console.log(data)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json("error while fetching request's")
  }
})

SinghTekRoute.get('/merchants', async (req, res) => {

  const userId = req.body.userId;

  const merchants = await Merchant.find({ singhtek_id: userId });

  return res.status(200).json(merchants);
})

SinghTekRoute.delete('/delete/merchant/:id', async (req, res) => {

  const userId = req.body.userId;
  const mid = req.params.id;
  try {
    await Merchant.findOneAndDelete({ singhtek_id: userId, _id:mid });
    return res.status(200).json("Merchant Deleted Success")
  } catch (error) {
    return res.status(401).json("Error while deleteting merchant")
  }
})

SinghTekRoute.delete('/delete/withdrawal/:id', async (req, res) => {
  const sid = req.body.userId;
  const wid = req.params.id;
  try {
    await Withdrawal.findOneAndDelete({ withdrawal_id:wid, subAdminID:sid});
    return res.status(200).json("withdrawal deleted success")
  } catch (error) {
    return res.status(401).json("error while deleting withdrawal")
  }
});

SinghTekRoute.post('/merchant/updatestatus', async (req, res) => {
  // Retrieve the withdrawal ID and merchant status from the request body
  const { merchant_id, merchant_status } = req.body;
  console.log(req.body)

  try {
    // Find the withdrawal by ID
    const user = await Merchant.findOne({ _id: merchant_id });

    if (!user) {
      // Withdrawal not found
      return res.status(404).json({ message: 'user not found' });
    }

    // Update the merchant status
    user.status = merchant_status;
    await user.save();

    // Return a response indicating the status update
    res.json({ message: 'Merchant status updated successfully' });
  } catch (error) {
    console.error('An error occurred while updating the merchant status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

SinghTekRoute.post('/withdrawal/updatestatus', async (req, res) => {
  // Retrieve the withdrawal ID and merchant status from the request body
  const { withdrawal_id, merchant_status } = req.body;

  try {
    // Find the withdrawal by ID
    const withdrawal = await Withdrawal.findOne({ withdrawal_id });

    if (!withdrawal) {
      // Withdrawal not found
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    // Update the merchant status
    withdrawal.merchant_status = merchant_status;
    await withdrawal.save();

    // Return a response indicating the status update
    res.json({ message: 'Merchant status updated successfully' });
  } catch (error) {
    console.error('An error occurred while updating the merchant status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

SinghTekRoute.put("/update/withdrawals", async (req, res) => {
  try {
    const updatedData = req.body; // Array of objects containing the updated data

    for (const data of updatedData) {
      data.updatedAt = new Date(); // Update the updatedAt field with the current date

      await Withdrawal.findOneAndUpdate({ withdrawal_id: data.remarks_1 }, data, { new: true });
    }

    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'An error occurred while updating data' });
  }
});


module.exports = SinghTekRoute;