const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OTPSchema = new Schema({
    otp:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true 
    },
    createAt:{
        type:Date,
        default:Date.now,
        expires:'5m'
    }
})

const OTP = mongoose.model("OTP", OTPSchema);
module.exports = OTP;
