const express = require('express');
const { Connection } = require('./config/db');
const SinghTekRoute = require('./routes/SinghTekUsers.route');
const MerchantRoute = require('./routes/Merchant.route');
const bodyParser = require('body-parser');
const app = express();
app.use('/tmp', express.static(path.join(__dirname, 'tmp')));
// Set the maximum payload size limit to 50MB (adjust as needed)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));



app.use(express.json())
const cors = require('cors');
const UserRoute = require('./routes/Users.route');
const AdminRoute = require('./routes/Admin.route');
const PayoutRoute = require('./routes/Payout.route');

app.use(cors());

app.get("/",(req,res)=>{
    return res.status(200).json("Payout Backend")
})

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