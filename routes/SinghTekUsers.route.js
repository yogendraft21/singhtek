const express = require('express');
const SinghTekRoute = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const SinghtekUser = require('../models/SinghTekUsers.model');
const Merchant = require('../models/Merchant.model');
const { auth } = require('../middleware/auth');
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
    const {email,password} = req.body;
    try {
          const user = await SinghtekUser.findOne({email:email})
          if(user){
            // compare hashed password with plain password
              bcrypt.compare(password,user.password,(err,result)=>{
                  if(result){
                    //on success generate token for user
                       const token = jwt.sign({userId:user._id},process.env.TOKEN_KEY);
                       return res.status(200).json(token)
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
SinghTekRoute.get('/merchants',async(req,res)=>{
  const singhtekUserId = '64699c85541ed506177ec833';
  const merchants = await Merchant.find({ singhtek_id: singhtekUserId });
  
  return res.status(200).json(merchants);
})
module.exports = SinghTekRoute;