
const express = require('express');
const SinghTekRoute = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const SinghtekUser = require('../models/SinghTekUsers.model');
const Merchant = require('../models/Merchant.model');
const { auth } = require('../middleware/auth');
const Withdrawal = require('../models/Withdraw.model');
require('dotenv').config()
SinghTekRoute.get("/",(req,res)=>{
    return res.status(200).json("SinghTek Route")
})

SinghTekRoute.post("/register",async(req,res)=>{
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

SinghTekRoute.post("/login",async(req,res)=>{
  // console.log(req.body)
    const {email,password} = req.body;
    try {
          const user = await SinghtekUser.findOne({email:email})
          console.log(user)
          if(user){
            // compare hashed password with plain password
              bcrypt.compare(password,user.password,(err,result)=>{
                  if(result){
                    
                    //on success generate token for user
                       const token = jwt.sign({userId:user._id},process.env.TOKEN_KEY);
                       return res.status(200).json(token)
                  }else{
                    return res.status(401).json("check email and password")
                  }
              })
          }else{
             return res.status(401).json("User Not found")
          }
          
    } catch (error) {
        return res.status(401).json({error:'error while login singhtek user'})
    }

})

SinghTekRoute.use(auth)

SinghTekRoute.post('/merchant/register', async (req, res) => {
  // console.log(req.body);
  const existingMerchant = await Merchant.findOne({ email: req.body.email });

  if (existingMerchant) {
    return res.status(401).json('Merchant already exists');
  }
  // console.log(req.body.userId)
  const subAdmin = await SinghtekUser.findOne({_id:req.body.userId})

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const merchant = new Merchant({
      singhtek_id: subAdmin._id,
      user_name: req.body.user_name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashedPassword,
      transaction_limit: req.body.transaction_limit,
      amount:req.body.amount,
      business_detail: req.body.business_detail,
      business_address: req.body.business_address,
      kyc_documents: req.body.kyc_documents, // Assign directly if it's an object
    });

    await merchant.save();

    res.status(200).json({ message: 'Merchant signup successful' });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: 'An error occurred during merchant signup' });
  }
});

SinghTekRoute.get("/getWithdrawals",async(req,res)=>{
  
  const id = req.body.userId;
  const data = await Withdrawal.find({subAdminID:id,merchant_status:'Allow'});
  console.log(data)
  return res.status(200).json(data)
})

SinghTekRoute.get('/merchants',async(req,res)=>{
  
  const userId = req.body.userId;
  
  const merchants = await Merchant.find({ singhtek_id: userId });
  
  return res.status(200).json(merchants);
})
module.exports = SinghTekRoute;