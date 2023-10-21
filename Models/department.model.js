const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    dept_ID:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true 
    },
    address:{
        type:String,
        required:true 
    },
    captain_ID:{
        type:String
    }

})

departmentSchema.methods.changeCaptain = async function(captainID){
    try{
        this.captain_ID=captainID;
        await this.save();
    }catch(error){
        throw error;
    }
}


const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;