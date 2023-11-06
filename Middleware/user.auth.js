const jwt = require('jsonwebtoken');
const { AuthError, NotFoundError } = require('../Error/error');
const { verifyToken } = require('../Controllers/Tools');
const User = require('../Models/user.model');

const userauth = async (req, res, next)=>{
    try{
        const token = req.cookies.usertoken;
        if(!token) throw new AuthError("Invalid Token");

        const payload = verifyToken(token);
        if(!payload) throw new AuthError("Invalid Token");
        
        const isExist = await User.findById(payload.id);
        if(!isExist) throw new NotFoundError("Invalid User")

        req.userID = isExist.id;
        next();
    }catch(error){
        console.log("User Auth", error.message)
        next(error);
    }
}

module.exports = userauth;