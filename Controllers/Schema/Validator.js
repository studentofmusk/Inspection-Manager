const Joi = require('joi');

//user -> firefighter
const userSignupSchema = Joi.object({
    firstname:Joi.string().required(),
    lastname:Joi.string().required(),
    email:Joi.string().email().required(),
    password:Joi.string().min(6).required(),
    cpassword:Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only':"Confirm password does not match with Password"
    }),
    departmentID:Joi.string().required(),
    otp:Joi.number().required()
});

const userLoginSchema= Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required(),
});
//department 
const departmentSchema= Joi.object({
    departmentID:Joi.string().required(),
    name:Joi.string().required(),
    address:Joi.string().required()
    
});
const adminApproveSchema= Joi.object({
    userID:Joi.string().required(),
    departmentID:Joi.string().required()
});

const masterSignupSchema = Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().min(6).required(),
    cpassword:Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only':"Confirm password does not match with Password"
    }),
    otp:Joi.number().required()
})
const masterLoginSchema = Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required()
})

const changePasswordSchema =  Joi.object({
    password:Joi.string().min(6).required(),
    cpassword:Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only':"Confirm password does not match with Password"
    }),
    token:Joi.string().required().messages({
        'any.only':"Token Not Found!"
    })
});


//Equipment Schema
const equipmentSchema = Joi.object({
    name:Joi.string().min(2).required(),
    description:Joi.string().min(20).required(),
    howtouse:Joi.string().min(10).required(),
    
});

const deleteEquipmentSchema = Joi.object({
    id:Joi.string().required(),
})

const createtruckSchema = Joi.object({
    truck_number:Joi.string().min(3).required()
});
const deletetruckSchema = Joi.object({
    truck_number:Joi.string().min(3).required()
});

const updatetruckSchema = Joi.object({
    truck_number:Joi.string().required(),
    driver_front_compartment:Joi.array().required(),
    driver_second_compartment:Joi.array().required(),
    driver_above_wheel_well:Joi.array().required(),
    driver_rear_compartment:Joi.array().required(),
    passenger_rear_compartment:Joi.array().required(),
    others:Joi.array().required()

})

module.exports = {
    userSignupSchema,
    userLoginSchema,
    departmentSchema,
    adminApproveSchema,
    masterSignupSchema,
    masterLoginSchema,
    changePasswordSchema,
    equipmentSchema,
    createtruckSchema,
    updatetruckSchema,
    deletetruckSchema,
    deleteEquipmentSchema
}