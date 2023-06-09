const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/Users.model');
const Merchant = require('../models/Merchant.model');
const { auth } = require('../middleware/auth');
const Withdrawal = require('../models/Withdraw.model');
const UserRoute = express.Router();

UserRoute.get("/", (req, res) => {
  return res.status(200).json("User route")
})

UserRoute.post('/login', async (req, res) => {

  const user = await User.findOne({ email: req.body.email });
  // console.log(req.body)
  if (user) {
    // compare hashed password with plain password
    try {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (result) {
          //on success generate token for user
          const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
          return res.status(200).json(token)
        }
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "error while user login" })
    }
  } else {
    return res.status(500).json('No user found')
  }

})

// UserRoute.use(auth);

UserRoute.patch("/edit", async (req, res) => {

  const user = await User.findById({ _id: req.body.userId });
  try {
    if (user) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
      console.log(req.body)
      await User.findByIdAndUpdate({ _id: req.body.userId }, req.body);
      return res.status(200).json({ message: 'user updated succesfully' })
    }
    else {
      return res.status(401).json('user not found')
    }
  } catch (error) {
    console.log(error)
    return res.status(401).json("Error in user update")
  }
})

UserRoute.post('/withdrawal', async (req, res) => {
  console.log(req.body);
  const { merchant_status, bank_status, beneficiary_branch_code, amount, ...withdrawalData } = req.body;
  const startWithdrawalId = 5748934;

  const lastWithdrawal = await Withdrawal.findOne().sort({ withdrawal_id: -1 });
  const lastWithdrawalId = lastWithdrawal ? parseInt(lastWithdrawal.withdrawal_id.substring(3)) : startWithdrawalId - 1;
  const nextWithdrawalId = lastWithdrawalId + 1;
  const withdrawalId = `WD-${nextWithdrawalId.toString().padStart(8, '0')}`;
  console.log(withdrawalId);

  try {
    const merchantUser = await Merchant.findOne({ _id: req.body.merchantID });
    console.log(merchantUser);

    let product_code = ''; // Variable to store the product_code

    if (beneficiary_branch_code && beneficiary_branch_code.length >= 4) {
      // Check if the first four characters of beneficiary_branch_code are "SBIN" (case-insensitive)
      if (beneficiary_branch_code.substring(0, 4).toUpperCase() === 'SBIN') {
        product_code = 'DSR';
      }
    }

    // If product_code is still empty, perform the amount check
    if (product_code === '') {
      if (amount > 20000) {
        product_code = 'RTGS';
      } else {
        product_code = 'NEFT';
      }
    }

    const withdrawal = new Withdrawal({
      withdrawal_id: withdrawalId,
      merchant_status: 'Pending',
      bank_status: 'Pending',
      product_code,
      amount,
      ...withdrawalData,
      merchantID: req.body.merchantID,
      subAdminID: merchantUser.singhtek_id
    });

    await withdrawal.save();
    res.status(201).json({ message: "Your request has been placed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while creating the withdrawal.' });
  }
});







module.exports = UserRoute