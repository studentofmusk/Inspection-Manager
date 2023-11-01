const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const truckSchema  = new Schema({
    truck_number:{
        type:String,
        required:true,
        unique:true
    },
    driver_front_compartment:{
        type:Array,
        default:[],
        required:true
    },
    driver_second_compartment:{
        type:Array,
        default:[],
        required:true
    },
    driver_above_wheel_well:{
        type:Array,
        default:[],
        required:true
    },
    driver_rear_compartment:{
        type:Array,
        default:[],
        required:true
    },
    passenger_rear_compartment:{
        type:Array,
        default:[],
        required:true
    },
    others:{
        type:Array,
        default:[],
        required:true
    },
    departmentID:{
        type:String,
        required:true
    }
})

truckSchema.methods.update = async function (truck_number,driver_front_compartment=[],driver_second_compartment=[],driver_above_wheel_well=[],driver_rear_compartment=[],passenger_rear_compartment=[],others=[]){
    try{

        this.truck_number = truck_number;
        this.driver_front_compartment = driver_front_compartment;
        this.driver_second_compartment = driver_second_compartment;
        this.driver_above_wheel_well = driver_above_wheel_well;
        this.driver_rear_compartment = driver_rear_compartment;
        this.passenger_rear_compartment = passenger_rear_compartment;
        this.others = others;
        await this.save()
        
    }catch(error){
        throw error;
    }
}

const Truck = mongoose.model("Truck",truckSchema);
module.exports = Truck;