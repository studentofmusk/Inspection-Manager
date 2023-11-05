const jwt = require('jsonwebtoken');
const { AuthError, NotFoundError } = require('../Error/error');
const { verifyToken } = require('../Controllers/Tools');
const User = require('../Models/user.model');

const adminauth = async (req, res, next)=>{
    try{
        const token = req.cookies.usertoken;
        
        if(!token) throw new AuthError("Invalid Token");

        const payload = verifyToken(token);
        if(!payload) throw new AuthError("Invalid Token");
        const isExist = await User.findOne({_id:payload.id, admin:true});
        if(!isExist) throw new NotFoundError("Invalid Admin")

        req.userID = isExist.id;
        next();
    }catch(error){
        console.log(error.message)
        next(error);
    }
}

module.exports = adminauth;