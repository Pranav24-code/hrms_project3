import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    employeeId:{
        type:String,
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["Manager","Employee"],
        default:"Employee",
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,   
    },
},
{
    timestamps:true,
}
);
const user =mongoose.model("User",userSchema);

export default user;