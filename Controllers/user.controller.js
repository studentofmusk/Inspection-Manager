const { BadRequestError, InternalServerError, Conflict } = require("../Error/error");
const { RaiseMail, RaiseOTP, Encrypt, DecryptAndCheck } = require("./Tools")
const { userSchema } = require("./Schema/Validator");
const Department = require("../Models/department.model");
const User = require("../Models/user.model");
const OTP = require("../Models/OTP.model");

const sendOTP  = async (req, res, next)=>{
    try{
        const email = req.query.email;
        if(!email) throw new BadRequestError("Invalid Email");
        const otp = await RaiseOTP(email);
        if(!otp) throw new InternalServerError("OTP Sent Failed!");
        const isExist =  await OTP.findOne({email});
        if(isExist){
            await OTP.findOneAndUpdate({email}, {otp, createAt:Date.now()});
        }else{
            const newOtp = new OTP({email, otp})
            await newOtp.save();
        }
        res.status(201).send({success:true, message:"OTP sent Successfully!"});

        
    }catch(error){
        next(error);
    }
}
//Create User Account
const signup = async(req, res, next)=>{
    try{
        //Validating Schema ->JOI
        const {error} = userSchema.validate(req.body); 
        if(error) throw new BadRequestError(error.details[0].message);

        const {firstname, lastname, email, password, cpassword, departmentID} = req.body;

        //Checking whether the department is Exist or not
        const isDeptExist = await Department.findOne({dept_ID:departmentID});
        if(!isDeptExist) throw new BadRequestError("Invalid Department ID");

        //Checking whether the user is exist or not
        const isUserExist = await User.findOne({email});
        if(isUserExist) throw new Conflict("User already Exist!");

        //Create new User
        const newUser = new User({
            firstname, lastname, departmentID:isDeptExist.dept_ID, email, password            
        })
        await newUser.save();

        res.status(201).send({success:true, message:"User Created Successfully!"});

    }catch(error){
        next(error)
    }
}
 
       
module.exports = {
    signup,
    sendOTP
}