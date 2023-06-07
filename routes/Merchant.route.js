const express = require('express');
const SinghtekUser = require('../models/SinghTekUsers.model');
const Merchant = require('../models/Merchant.model');
const MerchantRoute = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users.model');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');
const Withdrawal = require('../models/Withdraw.model');

MerchantRoute.use(express.json());
require('dotenv').config();

MerchantRoute.get('/', (req, res) => {
  return res.status(200).json('Merchant Route');
});
 

MerchantRoute.post('/login', async (req, res) => {
    
  const { email, password } = req.body;
  try {
    const user = await Merchant.findOne({ email: email });
    console.log(user);
    if (user) {
      // compare hashed password with plain password
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          // on success generate token for user
          const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
          return res.status(200).json({ token: `${token}` });
        } else {
          return res.status(401).json({ message: 'wrong email or password' });
        }
      });
    } else {
      return res.status(401).json('User Not found');
    }
  } catch (error) {
    return res.status(401).json({ error: 'error while login merchant' });
  }
});

MerchantRoute.use(auth);

MerchantRoute.get("/username",async(req,res)=>{
    const user = await Merchant.findOne({_id:req.body.userId});
    // console.log(user.user_name)
    return res.status(200).json(user.user_name);
})

MerchantRoute.post("/user/register", async (req, res) => {
    console.log(req.body)
    try {
      const { email, password } = req.body;
  
      // Check if the sr_number is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'email is already taken' });
      }
  
      const startCustomerId = 637801;
  
      const lastUser = await User.findOne().sort({ customer_id: -1 });
      
      // Generate the next customer_id by incrementing the last assigned id
      const lastCustomerId = lastUser ? parseInt(lastUser.customer_id) : startCustomerId - 1;
      const nextCustomerId = lastCustomerId + 1;
      const customer_id = nextCustomerId.toString().padStart(6, '0'); // Pad with leading zeros if needed
     
      // Get merchant_id 
      const merchant_id = req.body.userId;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new User({
        merchant_id: merchant_id,
        email: req.body.email,
        customer_id: customer_id,
        customer_name: req.body.customer_name,
        phone: req.body.phone,
        credit_account_no: req.body.credit_account_no,
        account_name: req.body.account_name,
        aadhar_number: req.body.aadhar_number,
        pan_number: req.body.pan_number,
        password: hashedPassword
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  })

MerchantRoute.get("/getWithdrawals",async(req,res)=>{
   const id = req.body.userId;
   const data = await Withdrawal.find({merchantID:id});
   return res.status(200).json(data)
})

MerchantRoute.get("/withdrawals/allow",async(req,res)=>{
    // console.log("hi")
  try {
    const withdrawals = await Withdrawal.find({ merchant_status: 'Allow', merchantID: req.body.userId });
    return res.status(200).json(withdrawals)
  } catch (error) {
    // Handle errors
    console.error('An error occurred while fetching Withdrawal data:', error);
  }
  
})

MerchantRoute.post('/withdrawal/updatestatus', async (req, res) => {
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

MerchantRoute.patch('/edit', async (req, res) => {
  const user = await Merchant.findById({ _id: req.body.userId });
  try {
    if (user) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
      const updated = await Merchant.findByIdAndUpdate({ _id: req.body.userId }, req.body);
      console.log(updated);
      return res.status(200).json({ message: 'user updated successfully' });
    } else {
      return res.status(401).json('user not found');
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json('Error in user update');
  }
});

MerchantRoute.get('/users', async (req, res) => {
  const merchantId = req.body.userId;
  const users = await User.find({ merchant_id: merchantId });
  return res.status(200).json(users);
});

MerchantRoute.delete('/user', async (req, res) => {
  const id = '6469c3af44b168ca8bf055e8';
  try {
    const user = await User.findByIdAndDelete({ _id: id });
    console.log(user);
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(401).json({ error: 'error while deleting user' });
  }
});

module.exports = MerchantRoute;
