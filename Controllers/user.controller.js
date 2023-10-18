const { BadRequestError, InternalServerError } = require("../Error/error");
const { RaiseMail, RaiseOTP, Encrypt, DecryptAndCheck } = require("./Tools")
const { userSchema } = require("./Validator")

const signup = (req, res, next)=>{
    try{
        //Validating Schema ->JOI
        const {error} = userSchema.validate(req.body); 
        if(error) throw new BadRequestError(error.details[0].message);

        const {firstname, lastname, email, password, cpassword, departmentID} = req.body;

        res.status(200).send(req.body);

    }catch(error){
        next(error)
    }
}


module.exports = {
    signup
}