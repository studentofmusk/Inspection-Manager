const { Conflict, BadRequestError, NotFoundError } = require("../Error/error");
const OTP = require("../Models/OTP.model");
const Department = require("../Models/department.model");
const Master = require("../Models/master.model");
const Notification = require("../Models/notification.model");
const User = require("../Models/user.model");
const { departmentSchema, adminApproveSchema, masterSignupSchema, masterLoginSchema } = require("./Schema/Validator");
const { DecryptAndCheck, generateToken } = require("./Tools");

//Create New Department
const createDepartment = async(req, res, next)=>{
    try{
        //Validating Schema
        const {error} = departmentSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);

        const {departmentID, name, address, captain} = req.body;
        
        //Check is the Department ID already Exist or not
        const isExist = await Department.findOne({dept_ID:departmentID});
        if(isExist) throw new Conflict("Department Already Exist");

        //Creating new Department
        const newDepartment = new Department({
            dept_ID:departmentID, name, address 
        });
        
        await newDepartment.save();
        
        res.status(201).send({success:true, message:"Department Created Successfully!"});

        
    }catch(error){
        next(error);
    }
}

const setCaptain = async(req, res, next)=>{
    try{
        const {error} = adminApproveSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);

        const {departmentID, userID} = req.body;

        const isDeptExist = await Department.findOne({dept_ID:departmentID})
        if(!isDeptExist) throw new NotFoundError("Invalid Department ID");

        const isUserExist = await User.findOne({user_ID:userID});
        if(!isUserExist) throw new NotFoundError("Invalid User ID");
        
        
        const isCaptainExist = await Department.findOne({captain_ID:isUserExist.user_ID})
        if(isCaptainExist) throw new Conflict(`User Already have an Admin Access at Department:${isCaptainExist.dept_ID}(${isCaptainExist.name})`);
        
        await isDeptExist.changeCaptain(isUserExist.user_ID);
        await isUserExist.grantAdmin()

        const raiseAlert = new Notification({
            from:"master",
            sender_type:2,   //master
            to:"all",
            receiver_type:0,  //user
            departmentID:isDeptExist.dept_ID,
            title:"New Fire Captain",
            message:`New Fire Captain (Admin) for \nDepartment name:${isDeptExist.name}\nDepartment ID:${isDeptExist.dept_ID}\n\nCaptain Details\nFull Name:${isUserExist.firstname} ${isUserExist.lastname}\nCaptain ID:${isUserExist.user_ID}`,
            redirect:`/`,
            notification_type:0, //normal
        });
        await raiseAlert.save();

        res.status(201).send({success:true, message:"Captain Attachment successful"})
            

    }catch(error){
        next(error);
    }    
}

const createMasterAccount = async(req, res, next)=>{
    try{
        //Validating Schema
        const {error} = masterSignupSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);

        const {email, password, otp} = req.body;
        
        //checking Existancies
        const isExist = await Master.findOne({email});
        if(isExist) throw new Conflict("Master Already Exist in this Email Address");

        //OTP Verification
        const isValid = await OTP.findOne({email, otp});
        if(!isValid) throw new BadRequestError("Invalid OTP!");


        const newMaster = new Master({
            email, password
        })
        await newMaster.save();
        
        res.status(201).send({success:true, message:"Master Account Created Successfully!"})

        const raiseAlert = new Notification({
            from:"master",
            sender_type:2,   //master
            to:"master",
            receiver_type:2,  //master
            departmentID:"master",
            title:"New Master Added",
            message:`email:${newMaster.email}`,
            redirect:`/master/masterlist`,
            notification_type:2, //alert
        });
        await raiseAlert.save();

    }catch(error){
        next(error);
    }
}


const loginMaster = async (req, res, next)=>{
    try {
        //Validating Schema 
        const {error} = masterLoginSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);

        const {email, password} = req.body;
        
        //Check Existencies
        const isExist = await Master.findOne({email})
        if(!isExist) throw new NotFoundError("Invalid Email or Password");

        //Password validation
        const isRight = await DecryptAndCheck(password, isExist.password);
        if(!isRight) throw new NotFoundError("Invalid Email or Password");

        
        //Token Creation
        const payload = {
            id:isExist.id
        }
        const token = generateToken(payload, "24h");
        res.cookie("Master", token, {
            httpOnly:true
        });

        //After Authorized
        res.status(200).send({success:true, message:"Login Successfule! Auto logout after 24 hours"});
    } catch (error) {
        next(error)
    }
}


module.exports = {
    createDepartment,
    setCaptain,
    createMasterAccount,
    loginMaster
}