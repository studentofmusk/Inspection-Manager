const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    from:{
        type:String,
        required:true
    },
    to:{
        type:String,
        required:true
    },
    sender_type:{
        type:Number,
        default:0, // 0:user, 1:admin, 2:master, 3.Department
        required:true    
    },
    receiver_type:{
        type:Number,
        default:0, // 0:user, 1:admin, 2:master, 3.department
        required:true    
    },
    title:{
        type:String,
        required:true 
    },
    message:{
        type:String,
        required:true 
    },
    redirect:{
        type:String,
        default:"",
        required:true
    },
    notification_type:{
        type:Number,
        default:0, // 0:normal notification 1:permission 2:alert 
        required:true 
    },
    status:{
        type:Number,
        default:0, //0:not seen 1:seen
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        required:true 
    },
    seenAt:{
        type:Date
    }
})

notificationSchema.methods.makeSeen = async function (date){
    try {
        this.seenAt = date;
        this.status = 1;
        await this.save();
    } catch (error) {
        throw error;  
    }
}


const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;