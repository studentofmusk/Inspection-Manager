const { Conflict, BadRequestError, NotFoundError } = require("../Error/error");
const Department = require("../Models/department.model");
const User = require("../Models/user.model");
const { departmentSchema, adminApproveSchema } = require("./Schema/Validator");

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
        
        if(isUserExist.admin) {
            const isCaptainExist = await Department.findOne({captain_ID:isUserExist.user_ID})
            if(isCaptainExist) throw new Conflict(`User Already have an Admin Access at Department:${isCaptainExist.dept_ID}(${isCaptainExist.name})`);
        }
        await isDeptExist.changeCaptain(isUserExist.user_ID);
        await isUserExist.grantAdmin()

        res.status(201).send({success:true, message:"Captain Attachment successful"})
            

    }catch(error){
        next(error);
    }    
}


module.exports = {
    createDepartment,
    setCaptain
}