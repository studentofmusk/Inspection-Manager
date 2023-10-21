const { BadRequestError, InternalServerError, Conflict, NotFoundError, AuthError } = require("../Error/error");
const { RaiseMail, RaiseOTP, DecryptAndCheck, generateToken} = require("./Tools")
const { userSignupSchema, userLoginSchema } = require("./Schema/Validator");
const Department = require("../Models/department.model");
const User = require("../Models/user.model");
const OTP = require("../Models/OTP.model");
const Notification = require("../Models/notification.model");


//------USER Schema-------
const createUserID = async()=>{
    try{
        const currentYear = new Date().getFullYear();
        const latestUser = await User.find({user_ID: new RegExp(`^FFD-${currentYear}`)})
                                     .sort({user_ID: -1})
                                     .limit(1);
        let nextNum;
        if (latestUser && latestUser.length) {
            const latestID = latestUser[0].user_ID;
            const lastSixDigits = parseInt(latestID.split('-').pop(), 10);
            nextNum = String(lastSixDigits + 1).padStart(6, '0'); // increment and pad with zeros to have 6 digits
        } else {
            nextNum = '000001';
        }
        
        return `FFD-${currentYear}-${nextNum}`;

    }catch(error){
        throw error
    }
}

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

        //Creating Unique UserID
        const userID = await createUserID();

        //Create new User
        const newUser = new User({
            user_ID:userID, firstname, lastname, departmentID:isDeptExist.dept_ID, email, password            
        })
        await newUser.save();

        //send Notification to department 
        const raiseRequest = new Notification({
            from:userID,
            sender_type:0,   //user
            to:isDeptExist.dept_ID,
            receiver_type:3,  //department
            departmentID:isDeptExist.dept_ID,
            title:"Login Request",
            message:`Requesting to grant charge us a Fire Fighter (User) for \nDepartment name:${isDeptExist.name}\nDepartment ID:${isDeptExist.dept_ID}\n\nUser Details\nFull Name:${newUser.firstname} ${newUser.lastname}\nUser ID:${newUser.user_ID}`,
            redirect:`/admin/approve?userID=${newUser.user_ID}&departmentID=${isDeptExist.dept_ID}`,
            notification_type:1, //permission
        });
        await raiseRequest.save();

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
        
        //Check Active status
        if(!user.active) throw new AuthError("Your Account still is under proccess");

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

const getNotifications = async (req, res, next)=>{
    try{
        const ID = req.userID;
        if(!ID) throw new BadRequestError("User ID not found");

        const isUserExist = await User.findById(ID);
        if(!isUserExist) throw new NotFoundError("Invalid User ID");

        const inbox = await Notification.find({
            $and:
            [
                {
                    $or:[
                        {to:isUserExist.user_ID},
                        {to:"all", receiver_type:0}
                    ]
                },
                {
                    departmentID:isUserExist.departmentID
                }
            ]
        },
        {
            redirect:0
        }
        );
        const outbox = await Notification.find({
            $and:
            [
                {
                    from:isUserExist.user_ID
                },
                {
                    departmentID:isUserExist.departmentID
                }
            ]
        },
        {
            redirect:0
        }
        );

        res.status(200).send({success:true, message:"Notification Fetched!", data:{inbox, outbox}});
    }catch(error){
        next(error);
    }
}
       
module.exports = {
    signup,
    login,
    sendOTP,
    getNotifications
}