const { Conflict, BadRequestError, NotFoundError } = require("../Error/error");
const OTP = require("../Models/OTP.model");
const Department = require("../Models/department.model");
const Master = require("../Models/master.model");
const Notification = require("../Models/notification.model");
const User = require("../Models/user.model");
const { departmentSchema, adminApproveSchema, masterSignupSchema, masterLoginSchema } = require("./Schema/Validator");
const { DecryptAndCheck, generateToken, RaiseMail } = require("./Tools");

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

        const isUserExist = await User.findOne({user_ID:userID, departmentID:isDeptExist.dept_ID});
        if(!isUserExist) throw new NotFoundError("Invalid User ID");
        
        
        const isCaptainExist = await Department.findOne({captain_ID:isUserExist.user_ID})
        if(isCaptainExist) throw new Conflict(`User Already have an Admin Access at Department:${isCaptainExist.dept_ID}(${isCaptainExist.name})`);
        
        const isOldCaptain = await User.findOne({user_ID:isDeptExist.captain_ID, departmentID:isDeptExist.dept_ID});
        if(isOldCaptain){
            await isOldCaptain.removeAdmin()
        }

        await isDeptExist.changeCaptain(isUserExist.user_ID);
        await isUserExist.grantAdmin()

        const mail = await RaiseMail(isUserExist.email, " Captain Assignment Confirmation",
         `
         You have been granted captain privileges for Department Name: ${isDeptExist.name}, Department ID: ${isDeptExist.dept_ID} . Congratulations! Your dedication and commitment are greatly appreciated, and we trust that you will continue to serve with excellence in your new role.

        If you have any questions or require further information, please do not hesitate to reach out to us. We wish you the best in your new responsibilities and look forward to your continued contributions.
        
Best regards,

Firehouse EquipGuard Team
FireEquipmentMonitor@gmail.com
        `)


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
        })
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
const logoutMaster = (req, res) => {
    res.clearCookie("Master"); 
    res.sendStatus(200);
}

const getMasterNotification = async(req, res, next)=>{
    try{
        const ID = req.masterID;
        if(!ID) throw new BadRequestError("Master ID Not found")

        const isMasterExist = await Master.findById(ID);
        if(!isMasterExist) throw new NotFoundError("Invalid Master ID");
        
        const inbox = await Notification.find({
            to:"master"
        }).sort({createdAt:-1});
        res.status(200).send({success:true, message:"Master Notifications Fetched", data:{inbox}});

    }catch(error){
        next(error);
    }
}

const getDepartments = async(req, res, next)=>{
    try {
        const departments = await Department.find();
        res.status(200).send({success:true, message:"Departments", data:departments});
    } catch (error) {
        next(error);
    }
}

const removeDeparment = async(req, res, next)=>{
    try {
        const id = req.query.id;
        const isDeleted = await Department.findByIdAndDelete(id);
        if(!isDeleted) throw new NotFoundError("Invalid ID");
        res.status(200).send({success:true, message:"Department Deleted"});
    } catch (error) {
        next(error);
    }
}

const adminApprove = async(req, res, next)=>{
    try{
        //Validate Query
        const userID = req.query.id;
        const deptID = req.query.deptID;
        if(!userID) throw new BadRequestError("User ID Not found");
        if(!deptID) throw new BadRequestError("Department ID Not Found");

        const masterID = req.masterID;
        if(!masterID) throw new AuthError("Access Denied!");

        //check Master Existancy
        const isMasterExist = await Master.findById(masterID);
        if(!isMasterExist) throw new AuthError("Access Denied!");

        //Checking User Existancy
        const isUserExist = await User.findOne({user_ID:userID});
        if(!isUserExist) throw new NotFoundError("Invalid User ID");
        
        //checking Captain Existency
        const isCaptainExist = await Department.findOne({captain_ID:userID});
        if(isCaptainExist) throw new AuthError("Your are Already a Captain of another Department! ");
        
        //Checking Department Existency
        const isDeptExist = await Department.findOne({dept_ID:deptID});
        if(!isDeptExist) throw new NotFoundError("Invalid Department ID")

        if(isDeptExist.captain_ID !== ""){
            const isOldCaptainExist = await User.findOne({user_ID:isDeptExist.captain_ID});
            if(isOldCaptainExist){

                await isOldCaptainExist.removeAdmin();  
            } 
        }

        await isDeptExist.changeCaptain(isUserExist.user_ID);
        await isUserExist.grantAdmin();

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
        })
        await raiseAlert.save();

        res.status(201).send({success:true, message:"Captain Attachment successful"})
            
    }catch(error){
        next(error);
    }
}
module.exports = {
    createDepartment,
    setCaptain,
    createMasterAccount,
    loginMaster,
    getMasterNotification,
    adminApprove,
    logoutMaster,
    getDepartments,
    removeDeparment
}