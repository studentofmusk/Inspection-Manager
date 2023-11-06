const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

//Env Variable
const SECRET_KEY = process.env.SECRETKEY;


//------Node Mailer-----

const Transport = nodemailer.createTransport({
    service:"gmail",
    host:'smtp.google.com',
    port:465,
    auth:{
        user:"mandalomail@gmail.com",
        pass:'oqwlgiqrzryhauov'
    },
    secure:true
})

const RaiseMail = async(to="", subject="", text="", html="")=>{

    const mailOptions = {
        from:process.env.USER,
        to,
        subject, 
        text,
        html
    }
    try {
    
        const info = await Transport.sendMail(mailOptions);
        return true;
        
    } catch (error) {
        console.log("Nodemailer:", error.message);
        return false;
    }

}

const GenerateOTP = ()=>{
    let otp = '';
    const possibleChars = '123456789';
    
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * possibleChars.length);
        otp += possibleChars[randomIndex];
    }

    return parseInt(otp);
}

const RaiseOTP = async(to="")=>{
    try{
        const otp = GenerateOTP();
        await  RaiseMail(to, "OTP Verification", `Your OTP is ${otp}`);
        return otp; 
    }catch(error){
        console.log("Nodemailer:",error.message)
        return false;
    }
}


//------Encryption------

const Encrypt = async(password)=>{
    try{
        const salt = 10;
        const hash = await bcryptjs.hash(password, salt);
        return hash;
    }catch(error){
        console.log("Bcrypt:", error.message);
        throw error
    }
}
const DecryptAndCheck = async(password, hashPassword)=>{
    try{
        return await bcryptjs.compare(password, hashPassword);
    }catch(error){
        console.log("Bcrypt:", error.message);
        return false;
    }
}

//-----JSON WEB TOKEN-----
const generateToken = (payload, expire="")=>{
    if(expire !==""){        
        const token = jwt.sign(payload, SECRET_KEY, {expiresIn:expire});
        return token;
    }
    const token = jwt.sign(payload, SECRET_KEY);
    return token;
    
}
const verifyToken = (token)=>{
    try{
        const payload = jwt.verify(token, SECRET_KEY);
        return payload;
    }catch(error){
        return false;
    }
    
}

function isDateToday(createdAt) {
    const currentDate = new Date();
    const createdAtDate = new Date(createdAt);

    // Check if the date parts (year, month, and day) are the same
    if (
        currentDate.getFullYear() === createdAtDate.getFullYear() &&
        currentDate.getMonth() === createdAtDate.getMonth() &&
        currentDate.getDate() === createdAtDate.getDate()
    ) {
        return 1; // The dates are the same (today)
    } else {
        return 0; // The dates are different
    }
}


module.exports= {
    RaiseMail,
    RaiseOTP,
    Encrypt, 
    DecryptAndCheck,
    generateToken,
    verifyToken,
    isDateToday
}