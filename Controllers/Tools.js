const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const bcryptjs = require('bcryptjs');

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
        console.log(info)
        return true;
        
    } catch (error) {
        console.log("Nodemailer:", error.message);
        return false;
    }

}

const GenerateOTP = ()=>{
    return randomstring.generate({
        length:6,
        charset:'numeric'
    })
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
        return false;
    }
}
const DecryptAndCheck = async(password, hashPassword)=>{
    try{
        await bcryptjs.compare(password, hashPassword);
        return true;
    }catch(error){
        // console.log("Bcrypt:", error.message);
        return false;
    }
}


module.exports= {
    RaiseMail,
    RaiseOTP,
    Encrypt, 
    DecryptAndCheck
}