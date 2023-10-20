const Joi = require('joi');

//user -> firefighter
const userSignupSchema = Joi.object({
    firstname:Joi.string().required(),
    lastname:Joi.string().required(),
    email:Joi.string().email().required(),
    password:Joi.string().required(),
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
module.exports = {
    userSignupSchema,
    userLoginSchema,
    departmentSchema
}