const Joi = require('joi');

//user -> firefighter
const userSchema = Joi.object({
    firstname:Joi.string().required(),
    lastname:Joi.string().required(),
    email:Joi.string().email().required(),
    password:Joi.string().required(),
    cpassword:Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only':"Confirm password does not match with Password"
    }),
    departmentID:Joi.string().required()
});

//department 
const departmentSchema= Joi.object({
    departmentID:Joi.string().required(),
    name:Joi.string().required(),
    address:Joi.string().required()

});
module.exports = {
    userSchema,
    departmentSchema
}