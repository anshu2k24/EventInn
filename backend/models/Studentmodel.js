const mongoose = require("mongoose");

const student = new mongoose.Schema(
    {
        NameOfStudent : { type : String , required : true },
        StudentEmail : { type : String , required : true },
        StudentPassword : { type : String , required : true },
        NumberOfEventsParticipatedIn : { type : Number , default : 0 },
        EventsParticipatedInId : [{ type : mongoose.Schema.Types.ObjectId , ref : "Event"}],
        AccountRegisterationDate : { type : Date , default : Date.now }
    }
)

module.exports = mongoose.model("Student" , student);