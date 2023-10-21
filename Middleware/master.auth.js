const { verifyToken } = require("../Controllers/Tools");
const { AuthError} = require("../Error/error");
const Master = require("../Models/master.model");

const masterauth = async (req, res, next)=>{
    try{
        const token = req.cookies.Master;
        if(!token) throw new AuthError("Session Timeout, Login again!");

        const payload = verifyToken(token);
        if(!payload) throw new AuthError("Unauthorized Request"); 

        const master = await Master.findById(payload.id);
        if(!master) throw new AuthError("Invalid Master Account!");
        
        req.masterID = master.id;
        next();
    }catch(error){
        next(error)
    }
}

module.exports = masterauth;