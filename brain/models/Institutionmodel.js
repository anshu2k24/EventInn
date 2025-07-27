const mongoose = require("mongoose");

const institution = new mongoose.Schema(
    {
        NameOfInstitution : { type : String , required : true },
        InstitutionEmail : { type : String , required : true },
        InstitutionPassword : { type : String , required : true },
        NumberOfEventsHosted : { type : Number , default : 0 },
        HostedEventId : [{ type : mongoose.Schema.Types.ObjectId , ref : "Event"}],
        RegisterationDate : { type : Date , default : Date.now }
    }
)

module.exports = mongoose.model("Institution" , institution);