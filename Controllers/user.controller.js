const { BadRequestError, InternalServerError, Conflict, NotFoundError } = require("../Error/error");
const { RaiseMail, RaiseOTP, Encrypt, DecryptAndCheck, generateToken } = require("./Tools")
const { userSignupSchema, userLoginSchema } = require("./Schema/Validator");
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
        const {error} = userSignupSchema.validate(req.body); 
        if(error) throw new BadRequestError(error.details[0].message);

        const {firstname, lastname, email, password, departmentID, otp} = req.body;

        //Checking whether the department is Exist or not
        const isDeptExist = await Department.findOne({dept_ID:departmentID});
        if(!isDeptExist) throw new BadRequestError("Invalid Department ID");

        //Checking whether the user is exist or not
        const isUserExist = await User.findOne({email});
        if(isUserExist) throw new Conflict("User already Exist!");
        
        //OTP Verification
        const isValid = await OTP.findOne({email, otp});
        if(!isValid) throw new BadRequestError("Invalid OTP!");
        
        //Create new User
        const newUser = new User({
            firstname, lastname, departmentID:isDeptExist.dept_ID, email, password            
        })
        await newUser.save();

        res.status(201).send({success:true, message:"User Created Successfully!"});

    }catch(error){
        console.log(error.message)
        next(error)
    }
}

// Login User Account
const login = async(req, res, next)=>{
    try {
        //Schema Validating
        const {error} = userLoginSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);

        const{email, password} = req.body;

        //User Validate
        const user = await User.findOne({email});
        if(!user) throw new NotFoundError("Invaid email or password");
            
        //Password Checkup
        const isValid = await DecryptAndCheck(password, user.password);
        console.log(isValid);
        if(!isValid) throw new NotFoundError("Invalid email or password");
        
        //Create a token ticket at client        
        const payload = {
            id:user.id
        };
        const token = generateToken(payload);        
        res.cookie("usertoken", token, {
            httpOnly:true
        });

        //After Authentication
        res.status(200).send({success:true, message:"Login Successful!"})

    } catch (error) {
        next(error);
    }
}

       
module.exports = {
    signup,
    login,
    sendOTP
}