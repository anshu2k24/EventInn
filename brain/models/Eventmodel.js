const mongoose = require("mongoose");

const event = new mongoose.Schema(
    {
        NameOfEvent : { type : String , required : true },
        EventDescription : { type : String , required : true },
        HostInstitutionEmail : { type : String , required : true },
        StartDateOfEvent : { type : Date , required : true },
        EndDateOfEvent : { type : Date , required : true },
        NumberOfParticipantsTillNow : { type : Number , default : 0 },
        ParticipantId : [{ type : mongoose.Schema.Types.ObjectId , ref : "Student"}],
        PublishDate : { type : Date , default : Date.now }
    }
)

module.exports = mongoose.model("Event" , event);