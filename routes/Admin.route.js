const express = require('express');
const SinghtekUser = require('../models/SinghTekUsers.model');
const Merchant = require('../models/Merchant.model');
const User = require('../models/Users.model');
const Admin = require('../models/Admin.model');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
require('dotenv').config();
const AdminRoute = express.Router();

AdminRoute.get("/",(req,res)=>{
    return res.status(200).json("Admin")
})

AdminRoute.post('/login',async(req,res)=>{
    
    const user = await Admin.findOne({email:req.body.email});
    // console.log(req.body)
    if(user){
      // compare hashed password with plain password
        try {
          bcrypt.compare(req.body.password,user.password,(err,result)=>{
            if(result){
              //on success generate token for user
                 const token = jwt.sign({userId:user._id},process.env.TOKEN_KEY);
                 return res.status(200).json({'token':token})
            }
        })
        } catch (error) {
          console.log(error)
         return res.status(401).json({error:"error while admin login"}) 
        }
    }else{
      return res.status(401).json('No user found')
    }
    
})

AdminRoute.use(auth)

AdminRoute.get('/SinghTekUsers',async(req,res)=>{
    try {
        // Find all Singhtek users
        const singhtekUsers = await SinghtekUser.find();
        res.json(singhtekUsers);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
})
AdminRoute.get('/Merchants',async(req,res)=>{
    try {
        // Find all Merchant users
        const MerchantUsers = await Merchant.find();
        res.json(MerchantUsers);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
})
AdminRoute.get('/Users',async(req,res)=>{
    try {
        // Find all users
        const Users = await User.find();
        res.json(Users);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
})

module.exports = AdminRoute