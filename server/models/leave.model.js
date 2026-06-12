import mongoose from "mongoose";

const leaveSchema =new mongoose.Schema({
    employee: {
        type:mongoose.Schema.Types.ObjectId,
        ref :"User",
        required:true
    },
    employeeId:{
        type:String,
        required :true
    },
      leaveType: {
      type: String,
      enum: [
        "annual",
        "sick",
        "casual",
        "maternity",
        "paternity",
        "unpaid",
      ],
      required: true,
    },
      reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

},
{
    timestamps:true,
}
)

export default mongoose.model("Leave",leaveSchema);