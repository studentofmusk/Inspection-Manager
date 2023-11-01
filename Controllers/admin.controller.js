const { BadRequestError, NotFoundError, AuthError, Conflict, ForbiddenError } = require("../Error/error");
const Department = require("../Models/department.model");
const Equipment = require("../Models/equipment.model");
const Notification = require("../Models/notification.model");
const Truck = require("../Models/truck.model");
const User = require("../Models/user.model");
const { adminApproveSchema, equipmentSchema, createtruckSchema, updatetruckSchema } = require("./Schema/Validator");
const multer = require('multer');

const adminSignup = async(req, res, next)=>{
    try{
        const {error} = adminApproveSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);

        const {departmentID, userID} = req.body;

        const isDeptExist = await Department.findOne({dept_ID:departmentID});
        if(!isDeptExist) throw new NotFoundError("Invalid Department ID!");
        
        const isUserExist = await User.findOne({user_ID:userID});
        if(!isUserExist) throw new NotFoundError("Invalid User ID!")    

        const raiseRequest = new Notification({
            from:userID,
            sender_type:0,   //user
            to:"master",
            receiver_type:2,  //master
            departmentID: isDeptExist.dept_ID,
            title:"Admin Request",
            message:`Requesting to grant charge us an Firecaptain(Admin) for \nDepartment name:${isDeptExist.name}\nDepartment ID:${isDeptExist.dept_ID}\n\nUser Details\nFull Name:${isUserExist.firstname} ${isUserExist.lastname}\nUser ID:${isUserExist.user_ID}`,
            redirect:`/master/approve?userID=${isUserExist.user_ID}&departmentID=${isDeptExist.dept_ID}`,
            notification_type:1, //permission
        });
        await raiseRequest.save();
        res.status(201).send({success:true, message:"Request sent Successfully! You can Access your Admin account after approve."})                
    }catch(error){
        next(error);
    }

}

//Get All Admin Notification
const getAdminNotification = async(req, res, next)=>{
    try{
        const ID = req.userID;
        if(!ID) throw new BadRequestError("Invalid User ID");

        const isUserExist = await User.findById(ID);
        if(!isUserExist && !isUserExist.admin) throw new NotFoundError("Invalid Admin ID");

        const isDeptExist = await Department.findOne({dept_ID:isUserExist.departmentID});
        if(!isDeptExist) throw new NotFoundError("Invalid Department ID");

        if(isDeptExist.captain_ID != isUserExist.user_ID) throw new AuthError("Access Denied")

        const inbox = await Notification.find({
            $and:
            [
                {
                    $or:[
                        {to:isUserExist.user_ID},
                        {to:"all"}
                    ]
                },
                {
                    departmentID:isUserExist.departmentID
                }
            ]
        }
        );
        const outbox = await Notification.find({
            $and:
            [
                {
                    $or:[
                        {from:isUserExist.user_ID}
                    ]
                },
                {
                    departmentID:isUserExist.departmentID
                }
            ]
        }
        );
        const deptInbox = await Notification.find({
            $and:
            [
                {
                    $or:[
                        {to:isUserExist.departmentID},
                        {to:"all"}
                    ]
                },
                {
                    departmentID:isUserExist.departmentID
                }
            ]
        }
        );
        const deptOutbox = await Notification.find({
            $and:
            [
                {
                    $or:[
                        {from:isUserExist.departmentID}
                    ]
                },
                {
                    departmentID:isUserExist.departmentID
                }
            ]
        }
        );


        res.status(200).send({success:true, message:"Notification Fetched", data:{inbox, outbox, deptInbox, deptOutbox}});
    }catch(error){
        next(error);
    }
}

//Make User Approve
const userApprove = async (req, res, next)=>{
    try{
        //Validate Query
        const userID = req.query.id;
        if(!userID) throw new BadRequestError("User ID Not found");
        
        const adminID = req.userID;
        if(!adminID) throw new AuthError("Access Denied!");

        //check Admin Existancy
        const isAdminExist = await User.findOne({_id:adminID, admin:true});
        if(!isAdminExist) throw new AuthError("Access Denied!");

        //checking Captain Existency
        const isCaptainExist = await Department.findOne({dept_ID:isAdminExist.departmentID, captain_ID:isAdminExist.user_ID});
        if(!isCaptainExist) throw new AuthError("Invalid Captain Access!");

        //Checking User Existancy
        const isUserExist = await User.findOne({user_ID:userID});
        if(!isUserExist) throw new NotFoundError("Invalid User ID");
        
        if(isAdminExist.departmentID !== isUserExist.departmentID) throw new ForbiddenError("User and Admin Department are NOT SAME");
        
        //Checking wheter the user already approved or not
        if(isUserExist.active) throw new Conflict("User Already in Active State!");

        await isUserExist.makeActive();

        const raiseNotification = new Notification({
            from:isAdminExist.user_ID,
            sender_type:1,   //admin
            to:isUserExist.user_ID,
            receiver_type:0,  //user
            departmentID: isAdminExist.departmentID,
            title:"User Request Accepted",
            message:`Now, You have access to Inspect and Explore thing from Here. \nDepartment name:${isCaptainExist.name}\nDepartment ID:${isCaptainExist.dept_ID}\n\nUser Details\nFull Name:${isUserExist.firstname} ${isUserExist.lastname}\nUser ID:${isUserExist.user_ID}`,
            redirect:`/`,
            notification_type:1, //permission
        });
        await raiseNotification.save();

        res.status(201).send({success:true, message:"User Approved successfully!"})
         
    }catch(error){
        next(error);
    }
}

//remove the user
const removeUser = async (req, res, next)=>{
    try{
        const userID = req.query.id;
        const adminID = req.userID;
        if(!userID) throw new BadRequestError("Invalid ID, ID not Found");
        if(!adminID) throw new BadRequestError("Invalid Admin ID, ID not Found");
        
        const isUserExist = await User.findOne({user_ID:userID});
        if(!isUserExist) throw new NotFoundError("No User Exist!");
        if(!isUserExist.active) throw new Conflict("User Already Deactivated!");

        const isAdminExist = await User.findById(adminID);
        if(!isAdminExist || !isAdminExist.admin) throw new AuthError("Invalid Admin!");

        const isDeptExist = await Department.findOne({dept_ID:isUserExist.departmentID});
        if(!isDeptExist) throw new BadRequestError("Invalid Department");
        if(isDeptExist.captain_ID !== isAdminExist.user_ID) throw new ForbiddenError("You are not Captain for the Given User's deparment!");

        if(isAdminExist.departmentID !== isUserExist.departmentID) throw new BadRequestError("Admin and User Department are not Same. User from other department!");
        if(isAdminExist.user_ID === isUserExist.user_ID) throw new BadRequestError("Your unable to Remove your Self");

        await isUserExist.makeDeactive();
        
        const raiseAlert = new Notification({
            from:isAdminExist.user_ID,
            sender_type:1,   //admin
            to:"all",
            receiver_type:0,  //user
            departmentID: isAdminExist.departmentID,
            title:"User Removed",
            message:` FireFighter Captain Removed a FireFighter from your Deparment! \nDepartment name:${isDeptExist.name}\nDepartment ID:${isDeptExist.dept_ID}\n\nUser Details\nFull Name:${isUserExist.firstname} ${isUserExist.lastname}\nUser ID:${isUserExist.user_ID}`,
            redirect:`/`,
            notification_type:2, //alert
        });
        await raiseAlert.save();
        res.status(201).send({success:true, message:"User Deactivated"});
    }catch(error){
        next(error);
    }
}

//It just a simple function which give the admin detail to the client
const setAdmin = async(req, res, next)=>{
    try {
        const ID = req.userID;
        if(!ID) throw new BadRequestError("invalid user ID");
        
        const adminData = await User.findById(ID, {firstname:1, lastname:1, admin:1, user_ID:1});
        if(!adminData) throw new NotFoundError("Admin Not found");
        
        res.status(200).send({success:true, message:"Permission Grant", data:adminData});
    } catch (error) {
        next(error);
    }
}

//--------------create equipment---------------------
const createEquipment = async(req, res, next)=>{
    try{
        const {error} = equipmentSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);
        
        const adminData = await User.findById(req.userID);
        
        if (!adminData) throw new AuthError("invalid User"); 


        const {name, description, howtouse} = req.body;
        const image = req.filename;
        const newEquipment = new Equipment({
            equipment_name:name, equipment_image:image, description, how_to_use:howtouse, departmentID:adminData.departmentID
        });

        await newEquipment.save();
        res.status(201).send({success:true, message:"Equipment added successfully!"});
        
    }catch(error){
        next(error);
    }
}

const equipmentsFolder = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/equipments/');
    },
    filename: (req, file, cb) => {
        let filesplit = file.originalname.split('.');  // Extract file extension
        let customFileName = filesplit[0] + Date.now(); // Use the provided filename or fallback to the current timestamp
        let fileExtension = filesplit[1];
        req.filename = `EQP-${customFileName}.${fileExtension}`;
        cb(null, `EQP-${customFileName}.${fileExtension}`);
    }
  });
  
const uploadEquipmentImage = multer({ storage: equipmentsFolder });

//----------------------------------------------------

//--------------create truck--------------------------
const createTruck = async(req, res, next)=>{
    try {
        const {error} = createtruckSchema.validate(req.body);
        if(error) throw new BadRequestError(error.details[0].message);

        const adminID = req.userID;
        const {truck_number} = req.body;
        
        const adminData = await User.findById(adminID);
        if(!adminData) throw new AuthError("Invalid User");

        const isExist = await Truck.findOne({truck_number:truck_number.toUpperCase(), departmentID:adminData.departmentID});
        if(isExist) throw new Conflict("Truck Already Exist"); 

        const newTruck = new Truck({truck_number:truck_number.toUpperCase(), departmentID:adminData.departmentID});
        await newTruck.save();
        res.status(201).send({success:true, message:"Truck Added Successfully!"});

    } catch (error) {
        next(error);
    }
}


//Add Equipments
const updateTruck = async(req, res, next)=>{
    try{
        const {error} = updatetruckSchema.validate(req.body);
        if(error)  throw new BadRequestError(error.details[0].message);
        
        const {
            truck_number, driver_front_compartment, driver_second_compartment, driver_above_wheel_well, driver_rear_compartment, passenger_rear_compartment, others
        } = req.body;
        const adminData = await User.findById(req.userID);
        const isTruckExist = await Truck.findOne({truck_number, departmentID:adminData.departmentID});
        if(!isTruckExist) throw new NotFoundError("Invalid Truck Number");

        await isTruckExist.update(truck_number, driver_front_compartment, driver_second_compartment, driver_above_wheel_well, driver_rear_compartment, passenger_rear_compartment, others)
        res.status(201).send({success:true, message:"Successfully Updated!"})
    }catch(error){
        next(error);
    }
}

//----------------------------------------------------

module.exports ={
    adminSignup,
    getAdminNotification,
    userApprove,
    removeUser,
    setAdmin,
    createEquipment,
    uploadEquipmentImage,
    createTruck,
    updateTruck


}

