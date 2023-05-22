const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/Users.model');
const Merchant = require('../models/Merchant.model');
const { auth } = require('../middleware/auth');
const UserRoute = express.Router();

UserRoute.get("/",(req,res)=>{
    return res.status(200).json("User route")
})

UserRoute.post("/register",async(req,res)=>{
    console.log(req.body)
    try {
        const { email,sr_number, beneficiary_name, credit_account_no, beneficiary_branch_code, amount, remarks, password } = req.body;
    
        // Check if the sr_number is already taken
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'email is already taken' });
        }
    
        // Get a random merchant_id
        const randomMerchant = await Merchant.aggregate([{ $sample: { size: 1 } }]);
        const merchant_id = randomMerchant[0]._id;
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create a new user
        const user = new User({
          merchant_id,
          email,
          sr_number,
          beneficiary_name,
          credit_account_no,
          beneficiary_branch_code,
          amount,
          remarks,
          password: hashedPassword,
        });
    
        // Save the user to the database
        await user.save();
    
        res.status(200).json({ message: 'User registered successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during registration' });
      }
})

UserRoute.post('/login',async(req,res)=>{
    
  const user = await User.findOne({email:req.body.email});
  // console.log(req.body)
  if(user){
    // compare hashed password with plain password
      try {
        bcrypt.compare(req.body.password,user.password,(err,result)=>{
          if(result){
            //on success generate token for user
               const token = jwt.sign({userId:user._id},process.env.TOKEN_KEY);
               return res.status(200).json(token)
          }
      })
      } catch (error) {
        console.log(error)
       return res.status(500).json({error:"error while user login"}) 
      }
  }else{
    return res.status(500).json('No user found')
  }
  
})

UserRoute.use(auth)

UserRoute.patch("/edit",async(req,res)=>{

      const user = await User.findById({_id:req.body.userId});
      try {
        if(user){
          // Hash the password
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          req.body.password = hashedPassword;
          console.log(req.body)
          await User.findByIdAndUpdate({_id:req.body.userId},req.body);
          return res.status(200).json({message:'user updated succesfully'})
        }
        else{
          return res.status(401).json('user not found')
        }
      } catch (error) {
        console.log(error)
        return res.status(401).json("Error in user update")
      }
})

module.exports = UserRoute