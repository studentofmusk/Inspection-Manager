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
})

module.exports = {
    userSignupSchema,
    userLoginSchema,
    departmentSchema,
    adminApproveSchema,
    masterSignupSchema,
    masterLoginSchema,
    changePasswordSchema
}