const mongoose = require('mongoose');
const { Encrypt } = require('../Controllers/Tools');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    
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
        required:true,
        unique:true  
    }
})

userSchema.pre('save', async function(next){
    try{
        if(this.isModified('password')){
            this.password = Encrypt(this.password);
        }
    }catch(error){
        next(error)
    }
})

const User = mongoose.model("User", userSchema);
module.exports = User;