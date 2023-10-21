const { BadRequestError, NotFoundError } = require("../Error/error");
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

module.exports ={
    adminSignup
}