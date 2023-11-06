const mongoose = require('mongoose');
const { Encrypt } = require('../Controllers/Tools');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_ID:{
        type:String,
        required:true,
        unique:true 
    }, 
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true
    },
    departmentID:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        required:true, 
        default:false
    },
    admin:{
        type:Boolean,
        default:false,
        required:true
    },
    fgtToken:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        required:true
    }
})

userSchema.methods.makeActive = async function(){
    try{
        this.active = true;
        await this.save();
    }catch(error){
        throw error;
    }
}

userSchema.methods.makeDeactive = async function(){
    try{
        this.active = false;
        await this.save();
    }catch(error){
        throw error;
    }
}


userSchema.methods.removeAdmin = async function (){
    try {
        this.admin = false;
        await this.save();
    } catch (error) {
        throw error
    }
}


userSchema.methods.grantAdmin = async function (){
    try {
        this.admin = true;
        this.active = true;
        await this.save();
    } catch (error) {
        throw error
    }
}

userSchema.methods.addFgtToken = async function(token){
    try{
        this.fgtToken = token;
        await this.save();
    }catch(error){
        throw error;
    }
}

userSchema.methods.removeFgtToken = async function(){
    try{
        this.fgtToken = "";
        await this.save();
    }catch(error){
        throw error;
    }
}

userSchema.methods.updatePassword = async function(newPassword){
    try{
        this.password = newPassword;
    }catch(error){
        throw error;
    }
}

userSchema.pre('save', async function(next){
    try{
        if(this.isModified('password')){
            this.password = await Encrypt(this.password);
        }
    }catch(error){
        next(error)
    }
})

const User = mongoose.model("User", userSchema);
module.exports = User;