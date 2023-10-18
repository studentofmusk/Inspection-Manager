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
    captainID:{
        type:String,
        unique:true
    }

})


const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;