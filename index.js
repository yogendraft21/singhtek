const express = require('express');
const { Connection } = require('./config/db');
const SinghTekRoute = require('./routes/SinghTekUsers.route');
const MerchantRoute = require('./routes/Merchant.route');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
app.use('/tmp', express.static(path.join(__dirname, 'tmp')));
// Set the maximum payload size limit to 50MB (adjust as needed)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));



app.use(express.json())
app.use(bodyParser.json());
const cors = require('cors');

const UserRoute = require('./routes/Users.route');
const AdminRoute = require('./routes/Admin.route');
const PayoutRoute = require('./routes/Payout.route');
const SinghtekUser = require('./models/SinghTekUsers.model');
const Merchant = require('./models/Merchant.model');
const Admin = require('./models/Admin.model');

app.use(cors());

app.get("/",(req,res)=>{
    return res.status(200).json("Payout Backend")
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check in Merchant schema
      const merchantUser = await Merchant.findOne({ email: email, status: 'Allow' });
      if (merchantUser) {
        bcrypt.compare(password, merchantUser.password, (err, result) => {
          if (result) {
            const token = jwt.sign({ userId: merchantUser._id }, process.env.TOKEN_KEY);
            return res.status(200).json({ token: `${token}`, UserType: `${merchantUser.user_type}`, Username: `${merchantUser.user_name}` });
          } else {
            return res.status(401).json({ message: 'Wrong email or password' });
          }
        });
      } else {
        // Check in SinghTekUser schema
        const user = await SinghtekUser.findOne({ email: email });
        if (user) {
          bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
              const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
              return res.status(200).json({ token: `${token}`, UserType: `${user.user_type}`, Username: `${user.username}` });
            } else {
              return res.status(401).json({ message: 'Wrong email or password' });
            }
          });
        } else {
          // Check in Admin schema
          const adminUser = await Admin.findOne({ email: email });
          if (adminUser) {
            bcrypt.compare(password, adminUser.password, (err, result) => {
              if (result) {
                const token = jwt.sign({ userId: adminUser._id }, process.env.TOKEN_KEY);
                return res.status(200).json({ token: `${token}`, Username: `${adminUser.username}` });
              } else {
                return res.status(401).json({ message: 'Wrong email or password' });
              }
            });
          } else {
            return res.status(401).json({ message: 'User not found' });
          }
        }
      }
    } catch (error) {
      return res.status(401).json({ error: 'Error while logging in' });
    }
  });
  
  

app.use('/Admin',AdminRoute)
app.use('/SinghTek',SinghTekRoute);
app.use('/Merchant',MerchantRoute);
app.use('/User',UserRoute);
app.use('/Payout',PayoutRoute);

app.listen(8080,async()=>{
    try {
        await Connection;
        console.log("DB connected succesfully")
    } catch (error) {
        console.log(error)
    }
    console.log("Server is running on port 8080")
})