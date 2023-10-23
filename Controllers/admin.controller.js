const { BadRequestError, NotFoundError, AuthError, Conflict, ForbiddenError } = require("../Error/error");
const Department = require("../Models/department.model");
const Notification = require("../Models/notification.model");
const User = require("../Models/user.model");
const { adminApproveSchema } = require("./Schema/Validator");

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




module.exports ={
    adminSignup,
    getAdminNotification,
    userApprove,
    removeUser

}