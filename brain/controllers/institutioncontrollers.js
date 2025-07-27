const Institution = require("../models/Institutionmodel");
const Student = require("../models/Studentmodel"); // Ensure Student model is imported
const Event = require("../models/Eventmodel");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otpmodel"); // Corrected import to just 'Otp' assuming it's in models/Otp.js

// Import the email and OTP utilities
const {
  sendOtpEmail,
  sendWelcomeEmailInstitution, // Ensure this is imported correctly from emailService
} = require("../services/emailServices"); // Corrected import path
const { generateOtp } = require("../utils/OtpGenerator"); // Corrected import path

// Your existing functions remain unchanged
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

// --- NEW OTP-BASED REGISTRATION FLOW FOR INSTITUTIONS ---

/**
 * Step 1: Send OTP for Email Verification for Institutions
 * This function will be called on a new route (e.g., POST /api/institution/send-otp)
 */
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

    const otp = generateOtp(); // Use the utility function
    const HashedPassword = await bcrypt.hash(InstitutionPassword, 10);

    // Find and update or create a new OTP record for the institution
    await Otp.findOneAndUpdate(
      { email: InstitutionEmail }, // Use 'email' field in Otp model
      {
        otp,
        name: NameOfInstitution, // Store temporary name
        password: HashedPassword, // Store temporary hashed password
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Send the OTP email using the email service
    const emailResult = await sendOtpEmail(InstitutionEmail, otp);

    if (emailResult.success) {
      // Respond to the client that the OTP has been sent
      res
        .status(200)
        .json({
          message:
            "OTP sent successfully. Please check your email to complete registration.",
        });
    } else {
      // Handle email sending failure
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

/**
 * Step 2: Verify OTP and Complete Institution Registration
 * This function will be called on a new route (e.g., POST /api/institution/register)
 */
async function registerInstitution(req, res) {
  const { InstitutionEmail, otp } = req.body;

  if (!InstitutionEmail || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }

  try {
    // Find the OTP record for the provided email and OTP
    const otpRecord = await Otp.findOne({ email: InstitutionEmail, otp });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // IMPORTANT: Add checks for name and password from otpRecord
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

    // Check if an institution with this email already exists (safety check)
    const existingInstitution = await Institution.findOne({ InstitutionEmail });
    if (existingInstitution) {
      await Otp.deleteOne({ _id: otpRecord._id }); // Clean up the OTP record
      return res.status(409).json({ error: "Email already registered as an Institution." });
    }

    // Check if a student with this email already exists (safety check)
    const existingStudent = await Student.findOne({ StudentEmail: InstitutionEmail }); // <--- CORRECTED THIS LINE
    if (existingStudent) {
      await Otp.deleteOne({ _id: otpRecord._id }); // Clean up the OTP record
      return res.status(409).json({ error: "Email already registered as a Student." });
    }

    // OTP is valid. Now, create the new institution.
    const newInstitution = await Institution.create({
      NameOfInstitution: otpRecord.name, // Use name from OTP record
      InstitutionEmail: otpRecord.email, // Use email from OTP record
      InstitutionPassword: otpRecord.password, // Use pre-hashed password from OTP record
    });

    // Clean up the temporary OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    // Now, send the welcome email after the institution is successfully created
    await sendWelcomeEmailInstitution(InstitutionEmail);

    // Respond with the newly created institution
    res.status(201).json(newInstitution);
  } catch (error) {
    console.error("Error in registerInstitution:", error);
    res.status(500).json({ error: "Error in registering institution." });
  }
}

// Update the module exports to include the new functions
module.exports = {
  addevent,
  getallevents,
  institutionmydetails,
  updateevent,
  sendVerificationOtpInstitution, // New function for sending OTP
  registerInstitution, // New function for verifying OTP and registering
};
