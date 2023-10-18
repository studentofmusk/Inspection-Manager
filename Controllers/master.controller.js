const { Conflict, BadRequestError } = require("../Error/error");
const Department = require("../Models/department.model");
const { departmentSchema } = require("./Schema/Validator");

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


module.exports = {
    createDepartment
}