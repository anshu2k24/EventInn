const Institution = require("../models/Institutionmodel");
const Student = require("../models/Studentmodel"); // Ensure Student model is imported
const Event = require("../models/Eventmodel");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otpmodel");

// Import the email and OTP utilities
const {
  sendOtpEmail,
  sendWelcomeEmailInstitution, 
} = require("../services/emailServices");
const { generateOtp } = require("../utils/OtpGenerator");

async function institutionmydetails(req, res) {
  const institutionid = req.institutionid;
  try {
    const instituionbyid = await Institution.findById(institutionid);
    if (!instituionbyid)
      return res.status(404).json({ error: "invalid institution id." });
    res.status(200).json(instituionbyid);
  } catch (error) {
    res.status(500).json({ error: "error in fetching institution details." });
  }
}

async function addevent(req, res) {
  const { NameOfEvent, EventDescription, StartDateOfEvent, EndDateOfEvent } =
    req.body;
  const institutionid = req.institutionid;
  try {
    const hostinstitution = await Institution.findById(institutionid);
    if (!hostinstitution)
      return res.status(404).json({ error: "invalid institution id." });
    const existing = await Event.findOne({
      NameOfEvent,
      EventDescription,
      HostInstitutionEmail: hostinstitution.InstitutionEmail,
    });
    if (existing)
      return res.status(409).json({ error: "event already exists." }); // 409 Conflict
    if (new Date(EndDateOfEvent) < new Date(StartDateOfEvent)) {
      return res
        .status(400)
        .json({ error: "End date must be after start date." });
    }
    const newEvent = await Event.create({
      NameOfEvent,
      EventDescription,
      HostInstitutionEmail: hostinstitution.InstitutionEmail,
      StartDateOfEvent,
      EndDateOfEvent,
    });
    hostinstitution.NumberOfEventsHosted += 1;
    hostinstitution.HostedEventId.push(newEvent._id);
    await hostinstitution.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: "error in hosting event." });
  }
}

async function updateevent(req, res) {
  const { NameOfEvent, EventDescription, StartDateOfEvent, EndDateOfEvent } =
    req.body;
  const eventid = req.params.eventid;
  const institutionid = req.institutionid;
  try {
    const hostinstitution = await Institution.findById(institutionid);
    if (!hostinstitution)
      return res.status(404).json({ error: "invalid institution id." });

    const eventtoupdate = await Event.findById(eventid);
    if (!eventtoupdate)
      return res.status(404).json({ error: "invalid event id." });

    if (
      hostinstitution.InstitutionEmail === eventtoupdate.HostInstitutionEmail
    ) {
      if (NameOfEvent) eventtoupdate.NameOfEvent = NameOfEvent;
      if (EventDescription) eventtoupdate.EventDescription = EventDescription;
      if (StartDateOfEvent) eventtoupdate.StartDateOfEvent = StartDateOfEvent;
      if (EndDateOfEvent) eventtoupdate.EndDateOfEvent = EndDateOfEvent;

      if (new Date(EndDateOfEvent) < new Date(StartDateOfEvent)) {
        return res
          .status(400)
          .json({ error: "End date must be after start date." });
      }

      await eventtoupdate.save();
      res.status(200).json({ update: "event updated." }); // 200 OK
    } else {
      return res
        .status(403)
        .json({
          error: "cannot update events not hosted by your institution.",
        }); // 403 Forbidden
    }
  } catch (error) {
    res.status(500).json({ error: "error in updating event." });
  }
}

async function getallevents(req, res) {
  try {
    const events = await Event.find();
    res.status(200).json(events); // 200 OK
  } catch (error) {
    res.status(500).json({ error: "error in fetching all events." });
  }
}

async function sendVerificationOtpInstitution(req, res) {
  const { NameOfInstitution, InstitutionEmail, InstitutionPassword } = req.body;

  // Basic validation to ensure required fields are present
  if (!NameOfInstitution || !InstitutionEmail || !InstitutionPassword) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  try {
    // Check if email is already registered as an Institution
    const existingInstitution = await Institution.findOne({ InstitutionEmail });
    if (existingInstitution) {
      return res.status(409).json({ error: "Email already registered as an Institution." });
    }
    // Check if email is already registered as a Student
    const existingStudent = await Student.findOne({ StudentEmail: InstitutionEmail }); // <--- CORRECTED THIS LINE
    if (existingStudent) {
      return res.status(409).json({ error: "Email already registered as a Student." });
    }

    const otp = generateOtp(); 
    const HashedPassword = await bcrypt.hash(InstitutionPassword, 10);

    await Otp.findOneAndUpdate(
      { email: InstitutionEmail },
      {
        otp,
        name: NameOfInstitution,
        password: HashedPassword, 
      },
      { upsert: true, new: true, runValidators: true }
    );


    const emailResult = await sendOtpEmail(InstitutionEmail, otp);

    if (emailResult.success) {
      res
        .status(200)
        .json({
          message:
            "OTP sent successfully. Please check your email to complete registration.",
        });
    } else {
      console.error("Error sending OTP email:", emailResult.error);
      res.status(500).json({ error: "Failed to send OTP email." });
    }
  } catch (error) {
    console.error("Error in sendVerificationOtpInstitution:", error);
    res
      .status(500)
      .json({ error: "Error during the OTP sending process for institution." });
  }
}

async function registerInstitution(req, res) {
  const { InstitutionEmail, otp } = req.body;

  if (!InstitutionEmail || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }

  try {
    const otpRecord = await Otp.findOne({ email: InstitutionEmail, otp });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }
    if (!otpRecord.name || !otpRecord.password) {
      console.error(
        "OTP record missing name or password for institution:",
        otpRecord
      );
      return res
        .status(400)
        .json({
          error:
            "Incomplete OTP record for institution. Please try registration again.",
        });
    }

    const existingInstitution = await Institution.findOne({ InstitutionEmail });
    if (existingInstitution) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(409).json({ error: "Email already registered as an Institution." });
    }

    const existingStudent = await Student.findOne({ StudentEmail: InstitutionEmail });
    if (existingStudent) {
      await Otp.deleteOne({ _id: otpRecord._id }); // Clean up the OTP record
      return res.status(409).json({ error: "Email already registered as a Student." });
    }

    const newInstitution = await Institution.create({
      NameOfInstitution: otpRecord.name, // Use name from OTP record
      InstitutionEmail: otpRecord.email, // Use email from OTP record
      InstitutionPassword: otpRecord.password, // Use pre-hashed password from OTP record
    });

    await Otp.deleteOne({ _id: otpRecord._id });

    await sendWelcomeEmailInstitution(InstitutionEmail);

    res.status(201).json(newInstitution);
  } catch (error) {
    console.error("Error in registerInstitution:", error);
    res.status(500).json({ error: "Error in registering institution." });
  }
}

module.exports = {
  addevent,
  getallevents,
  institutionmydetails,
  updateevent,
  sendVerificationOtpInstitution,
  registerInstitution,
};
