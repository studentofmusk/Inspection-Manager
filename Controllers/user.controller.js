const { BadRequestError, InternalServerError, Conflict, NotFoundError, AuthError, ForbiddenError } = require("../Error/error");
const { RaiseMail, RaiseOTP, DecryptAndCheck, generateToken, verifyToken} = require("./Tools")
const { userSignupSchema, userLoginSchema, changePasswordSchema, updateDetailsSchema, inspectionUploadSchema } = require("./Schema/Validator");
const Department = require("../Models/department.model");
const User = require("../Models/user.model");
const OTP = require("../Models/OTP.model");
const Notification = require("../Models/notification.model");
const Truck = require("../Models/truck.model");
const Equipment = require("../Models/equipment.model");
const Inspection = require("../Models/inspection.model");


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
        
        if(!isValid) throw new NotFoundError("Invalid email or password");
        
        //Check Active status
        if(!user.active) throw new AuthError("Your Account still is under proccess");

        //Create a token ticket at client        
        const payload = {
            id:user.id,
            username:`${user.firstname} ${user.lastname}`,
            admin:user.admin,
            userID:user.user_ID
        };
        const token = generateToken(payload, expire="365d");        
        res.cookie("usertoken", token, {
            httpOnly:true
        });

        //After Authentication
        res.status(200).send({success:true, message:"Login Successful!", data:payload})

    } catch (error) {
        next(error);
    }
}
const forgotPassword = async(req, res, next)=>{
    try{
        const email = req.query.email;
        if(!email) throw new BadRequestError("Invalid Email address!");
        
        //check user validation
        const isExist = await User.findOne({email});
        if(!isExist) throw new BadRequestError("Invalid Email address!");
        
        //generate Token
        const token = generateToken({id:isExist.id}, "15m");

        //add Token at user Document field
        await isExist.addFgtToken(token);
        
        await RaiseMail(isExist.email, "Forgot Password Request","You can change your password by clicking this link", `<h4>You can change your password by clicking this link</h4><br/><a href="${process.env.DOMAIN}/account/changepassword?id=${token}">click here</a>` );

        res.status(200).send({success:true, message:"Request Sent successfully! Please check your Mail"});

    }catch(error){
        next(error);
    }
}
const changePassword = async (req, res, next)=>{
    try{
        //Schema Validation
        const {error} = changePasswordSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);

        const {password, token} = req.body;
        
        //token verification
        const isTokenValid = verifyToken(token);
        if(!isTokenValid) throw new BadRequestError("Token Invalid or Expired!");

        const id = isTokenValid.id; 
        
        //checking token validation
        const isUserExist = await User.findById(id);
        if(!isUserExist) throw new NotFoundError("Invalid User");
        if(isUserExist.fgtToken !== token) throw new ForbiddenError("Invalid User Token!");  

        await isUserExist.removeFgtToken();
        await isUserExist.updatePassword(password);
        
        res.status(201).send({success:true, message:"Password Changed Successfully!"});
        

    }catch(error){
        next(error);
    }
}
const getNotifications = async (req, res, next)=>{
    try{
        let id = req.query.id;

        const ID = req.userID;
        if(!ID) throw new BadRequestError("User ID not found");
        if(id === "1"){
            id= 1;
        }else{
            id=0
        }
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
                    departmentID:isUserExist.departmentID,
                    sender_type:id
                }
            ]
        },
        {
            "from":1,
            "to": 1,
            "sender_type": 1,
            "receiver_type": 1,
            "title": 1,
            "notification_type": 1,
            "createdAt":1,
            "status": 1,
        }
        );
        // const outbox = await Notification.find({
        //     $and:
        //     [
        //         {
        //             from:isUserExist.user_ID
        //         },
        //         {
        //             departmentID:isUserExist.departmentID,
        //             receiver_type:id
        //         }
        //     ]
        // },
        // {
        // "from":1,
        // "to": 1,
        // "sender_type": 1,
        // "receiver_type": 1,
        // "title": 1,
        // "notification_type": 1,
        // "createdAt":1,
        // "status": 1,
        // }
        // );

        res.status(200).send({success:true, message:"Notification Fetched!", data:{inbox}});
    }catch(error){
        next(error);
    }
}

const getNotification = async(req, res, next)=>{
    try{
        const id = req.query.id;
        if(!id) throw new BadRequestError("Invalid ID");
        
        const userDetails = await User.findById(req.userID, {user_ID:1, departmentID:1});
        if(!userDetails) throw new AuthError("Invalid User");
        
        const notification = await Notification.findOne({_id:id, departmentID:userDetails.departmentID});
        
        if(!notification) throw new NotFoundError("Invalid ID");
        if(notification.to !== userDetails.user_ID && notification.to !=="all") throw new AuthError("Invalid ID");

        res.status(200).send({success:true, message:"Message Details", data:notification});

    }catch(error){
        next(error);
    }
}
const userTypes = async(req, res)=>{
    try {
        const ID = req.userID;
        if(!ID) throw new BadRequestError("invalid user ID");
        
        const userData = await User.findById(ID, {firstname:1, lastname:1, admin:1, user_ID:1});
        if(!userData) throw new NotFoundError("User Not found");
        
        res.status(200).send({success:true, message:"Permission Grant", data:userData});
    } catch (error) {
        next(error);
    }
}
const logout = (req, res) => {
    res.clearCookie("usertoken"); 
    res.sendStatus(200);
}
const updateDetails = async(req, res, next)=>{
    try {
        const {error} = updateDetailsSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);

        const {firstname, lastname} = req.body;
        const userID = req.userID;
        // console.log(userID)
        const isExist =await User.findByIdAndUpdate(userID, {firstname, lastname});
        if(!isExist) throw new NotFoundError("Unable to Update!");

        res.status(201).send({success:true, message:"Updated successfully!"});
        
    } catch (error) {
        next(error);
    }
}
const getDetails = async(req, res, next)=>{
    try{
        const userID = req.userID;
        if(!userID) throw new AuthError("Invalid User");

        const userData = await User.findById(userID, {password:0,fgtToken:0});
        if(!userData) throw new NotFoundError("Invalid User");
        res.status(200).send({success:true, message:"User Data", data:userData});
    }catch(error){
        next(error);
    }
}
const getTrucks  = async(req, res, next)=>{
    try {
        const userDetails = await User.findById(req.userID);
        const trucks = await Truck.find({departmentID:userDetails.departmentID}, {truck_number:1});
        res.status(200).send({success:true, message:"Trucks", data:trucks});
    } catch (error) {
        next(error);
    }
}
const getTruck = async(req, res, next)=>{
    try{
        const {id} = req.query;
        if(!id) throw new BadRequestError("Invalid Equipment ID");
        const userDetails = await User.findById(req.userID);
        const truck = await Truck.findOne({_id:id, departmentID:userDetails.departmentID});
        if(!truck) throw new NotFoundError("Invalid Equipment ID");

        res.status(200).send({success:true, message:"Truck Details", data:truck});
    }catch(error){
        next(error);
    }
}
const getEquipments = async(req, res, next)=>{
    try {
        const userDetails = await User.findById(req.userID);
        const equipments = await Equipment.find({departmentID:userDetails.departmentID}, {equipment_name:1, equipment_image:1})
        res.status(200).send({success:true, message:"Equipments", data:equipments});
    } catch (error) {
        next(error);
    }
}
const getEquipment = async(req, res, next)=>{
    try {
        const {id} = req.query;
        if(!id) throw new BadRequestError("Invalid Equipment ID");
        const userDetails = await User.findById(req.userID);
        const equipment = await Equipment.findOne({_id:id,departmentID:userDetails.departmentID}, {departmentID:0});
        if(!equipment) throw new NotFoundError("Invalid Equipment ID");

        res.status(200).send({success:true, message:"Equipment Details", data:equipment});
    } catch (error) {
        next(error);
    }
}
const submitInspection = async(req,res, next)=>{
    try{
        const {error} = inspectionUploadSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);
        const userID = req.userID;
        if(!userID) throw new AuthError("Invalid User");
        const userDetails = await User.findById(userID);
        if(!userDetails) throw new NotFoundError("User Not Found");

        let {
            truck_number,
            truck_id,
            driver_front_compartment,
            driver_second_compartment,
            driver_above_wheel_well,
            driver_rear_compartment,
            passenger_rear_compartment,
            others
        } = req.body;

        driver_front_compartment  = await Promise.all(
        driver_front_compartment =  driver_front_compartment.map(async(element)=>{
            let equipment = await Equipment.findById(element[0], {equipment_image:1, equipment_name:1});
            if(equipment){
                let copyele =  [...element];
                copyele.splice(0, 1, equipment.equipment_name, equipment.equipment_image);
                return copyele;
            }else{
                let copyele =  [...element];
                copyele.splice(0, 1, "", "");
                return copyele;
                
            }
        })
        )
        

        driver_second_compartment = await Promise.all(
        driver_second_compartment =  driver_second_compartment.map(async(element)=>{
            let equipment = await Equipment.findById(element[0], {equipment_image:1, equipment_name:1});
            if(equipment){
                let copyele =  [...element];
                copyele.splice(0, 1, equipment.equipment_name, equipment.equipment_image);
                return copyele;
            }else{
                let copyele =  [...element];
                copyele.splice(0, 1, "", "");
                return copyele;
                
            }
        })
        )
         

        driver_above_wheel_well = await Promise.all(
        driver_above_wheel_well =  driver_above_wheel_well.map(async(element)=>{
            let equipment = await Equipment.findById(element[0], {equipment_image:1, equipment_name:1});
            if(equipment){
                let copyele =  [...element];
                copyele.splice(0, 1, equipment.equipment_name, equipment.equipment_image);
                return copyele;
            }else{
                let copyele =  [...element];
                copyele.splice(0, 1, "", "");
                return copyele;
                
            }
        })
        )
        driver_rear_compartment = await Promise.all(
        driver_rear_compartment =  driver_rear_compartment.map(async(element)=>{
            let equipment = await Equipment.findById(element[0], {equipment_image:1, equipment_name:1});
            if(equipment){
                let copyele =  [...element];
                copyele.splice(0, 1, equipment.equipment_name, equipment.equipment_image);
                return copyele;
            }else{
                let copyele =  [...element];
                copyele.splice(0, 1, "", "");
                return copyele;
                
            }
        })
        )
         
        passenger_rear_compartment = await Promise.all(
        passenger_rear_compartment =  passenger_rear_compartment.map(async(element)=>{
            let equipment = await Equipment.findById(element[0], {equipment_image:1, equipment_name:1});
            if(equipment){
                let copyele =  [...element];
                copyele.splice(0, 1, equipment.equipment_name, equipment.equipment_image);
                return copyele;
            }else{
                let copyele =  [...element];
                copyele.splice(0, 1, "", "");
                return copyele;
                
            }
        })
        )
         
        others = await Promise.all(
        others =  others.map(async(element)=>{
            let equipment = await Equipment.findById(element[0], {equipment_image:1, equipment_name:1});
            if(equipment){
                let copyele =  [...element];
                copyele.splice(0, 1, equipment.equipment_name, equipment.equipment_image);
                return copyele;
            }else{
                let copyele =  [...element];
                copyele.splice(0, 1, "", "");
                return copyele;
                
            }
        })
        )
         

        const isTruckExist = await Truck.findOne({truck_number});
        if(!isTruckExist) throw new NotFoundError("Invalid Truck");

        const newInspection = new Inspection({
            name:`${userDetails.firstname} ${userDetails.lastname}`,
            userID:userDetails.user_ID,
            truck_number,
            truck_id,
            driver_front_compartment,
            driver_second_compartment,
            driver_above_wheel_well,
            driver_rear_compartment,
            passenger_rear_compartment,
            others,
            departmentID:userDetails.departmentID

        });
        const isSave = await newInspection.save();
        if(!isSave) throw new InternalServerError("Unable to Submit!");

        const raiseNotification = new Notification({
            from:userDetails.user_ID,
            sender_type:0,   //admin
            to:"all",
            receiver_type:0,  //user
            departmentID: userDetails.departmentID,
            title:`Truck NO: ${truck_number} Inspection Result`,
            message:`Truck NO: ${truck_number} Inspection was successfully completed. You can see the result at Maitainance page`,
            redirect:`/maintenance/oldview?id=${isSave._id}`,
            notification_type:0, //permission
        });
        await raiseNotification.save();
        res.status(201).send({success:true, message:"Successfully Updated!"});

    }catch(error){
        next(error);
    }
}

const getInspectionById = async(req, res, next)=>{
    try{
        const id = req.query.id;
        if(!id) throw new BadRequestError("Truck ID Not Found");
        const userDetails = await User.findById(req.userID);
        
        const inspection = await Inspection.findById(id); 
        if(!inspection) throw new NotFoundError("Invalid Inspection ID");
        res.status(200).send({success:true, message:"Inspection Detail", data:inspection})
    }catch(error){
        next(error);
    }
};
const getInspectionTruckWise = async(req, res, next)=>{
    try{
        const id = req.query.id;
        if(!id) throw new BadRequestError("Truck ID Not Found");
        const userDetails = await User.findById(req.userID);
        let count = req.query.count;
        let lists = []

        if(count){
            count = parseInt(count);
            lists = await Inspection.find({truck_number:id, departmentID:userDetails.departmentID}).sort({createdAt:-1}).limit(count); 
        }else{
            lists = await Inspection.find({truck_number:id, departmentID:userDetails.departmentID}).sort({createdAt:-1}); 

        }
        // const lists = await Inspection.find({truck_number:id, departmentID:userDetails.departmentID})
        res.status(200).send({success:true, message:"Inspections", data:lists})
    }catch(error){
        next(error);
    }
}

module.exports = {
    signup,
    login,
    sendOTP,
    getNotifications,
    getNotification,
    forgotPassword,
    changePassword,
    userTypes,
    logout,
    updateDetails,
    getTrucks,
    getTruck,
    getEquipments,
    getEquipment,
    getDetails,
    submitInspection,
    getInspectionTruckWise,
    getInspectionById
}