const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Firedepartment")
.then(()=>console.log("DB Connected!"))
.catch((err)=>console.log("DB Connection Failed due to ", err.message));
