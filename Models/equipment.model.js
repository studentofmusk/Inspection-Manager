const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const equipmentSchema = new Schema({
    equipment_name:{
        type:String,
        required:true
    },
    equipment_image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true 
    },
    how_to_use:{
        type:String,
        required:true
    },
    departmentID:{
        type:String,
        required:true
    }
    
});

const Equipment = mongoose.model("Equipment", equipmentSchema);
module.exports = Equipment;