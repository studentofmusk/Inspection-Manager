const mongoose = require('mongoose');
const { Encrypt } = require('../Controllers/Tools');
const Schema = mongoose.Schema;

const masterSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});
masterSchema.pre('save', async function(next){
    try{
        if(this.isModified('password')){
            this.password = await Encrypt(this.password);
        }
    }catch(error){
        next(error)
    }
})

const Master = mongoose.model("Master", masterSchema);
module.exports = Master;