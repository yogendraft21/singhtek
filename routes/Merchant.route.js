const express = require('express');
const SinghtekUser = require('../models/SinghTekUsers.model');
const Merchant = require('../models/Merchant.model');
const MerchantRoute = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/Users.model');
const { auth } = require('../middleware/auth');
require('dotenv').config()

MerchantRoute.get("/", (req, res) => {
    return res.status(200).json("SinghTek Route")
})

MerchantRoute.post("/register", async (req, res) => {

    const existingMerchant = await Merchant.findOne({ email: req.body.email });
    // console.log(req.body)
    if (existingMerchant) {
        return res.status(401).json("Merchant Already exist")
    }
    try {
        // Generate a random SinghtekUser ID
        const randomSinghtekUserId = await SinghtekUser.aggregate([{ $sample: { size: 1 } }]);

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new merchant
        const merchant = new Merchant({
            singhtek_id: randomSinghtekUserId[0]._id, // Assign random SinghtekUser ID
            email: req.body.email,
            customer_name: req.body.customer_name,
            debit_account_no: req.body.debit_account_no,
            product_code: req.body.product_code,
            dealer_code: req.body.dealer_code,
            beneficiary_code: req.body.beneficiary_code,
            credit_account_no: req.body.credit_account_no,
            amount: req.body.amount,
            remarks: req.body.remarks,
            docs: req.body.docs,
            password: hashedPassword,
        });

        await merchant.save();

        res.status(200).json({ message: 'Merchant signup successful' });
    } catch (error) {
        console.log(error)
        res.status(401).json({ error: 'An error occurred during merchant signup' });
    }
})

MerchantRoute.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    try {
          const user = await Merchant.findOne({email:email})
          console.log(user)
          if(user){
            // compare hashed password with plain password
              bcrypt.compare(password,user.password,(err,result)=>{
                  if(result){
                    //on success generate token for user
                       const token = jwt.sign({userId:user._id},process.env.TOKEN_KEY);
                       return res.status(200).json(token)
                  }else{
                    return res.status(401).json({message:'wrong email or password'})
                  }
              })
          }else{
             return res.status(401).json("User Not found")
          }
          
    } catch (error) {
        return res.status(401).json({error:'error while login merchant'})
    }

})

MerchantRoute.use(auth)

MerchantRoute.patch("/edit",async(req,res)=>{

    const user = await Merchant.findById({_id:req.body.userId});
    try {
      if(user){
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;
        // console.log(req.body)
        const updated = await Merchant.findByIdAndUpdate({_id:req.body.userId},req.body);
        console.log(updated)
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

MerchantRoute.get('/users',async(req,res)=>{
    const merchantId = '6469a40e00c276cde088a6a8';
    const users = await User.find({ merchant_id: merchantId });
    
    return res.status(200).json(users);
})

MerchantRoute.delete('/user',async(req,res)=>{
    const id = '6469c3af44b168ca8bf055e8';
    try {
        const user = await User.findByIdAndDelete({_id:id});
        console.log(user)
        return res.status(200).json({message:"User delete successfully"})
    } catch (error) {
        return res.status(401).json({error:'error while deleting user'})
    }
})

module.exports = MerchantRoute;