const mongoose = require("mongoose")

const Connection = mongoose.connect('mongodb+srv://yogendra:yogendra@cluster0.r2gbftx.mongodb.net/singhtek', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
 
module.exports={
    Connection
}
