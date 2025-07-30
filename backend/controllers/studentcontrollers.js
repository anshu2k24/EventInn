const Student = require("../models/Studentmodel");
const Institution = require("../models/Institutionmodel"); // Ensure Institution model is imported
const Event = require("../models/Eventmodel");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otpmodel"); 
const {
  sendOtpEmail,
  sendWelcomeEmailStudent,
} = require("../services/emailServices");
const { generateOtp } = require("../utils/OtpGenerator");

async function studentmydetails(req, res) {
  const studentid = req.studentid;
  try {
    const student = await Student.findById(studentid);
    if (!student) return res.status(404).json({ error: "invalid student id." });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: "error in fetching student details." });
  }
}

async function enrollstudentinevent(req, res) {
  const studentid = req.studentid;
  const eventid = req.params.eventid;
  try {
    const student = await Student.findById(studentid);
    if (!student) return res.status(404).json({ error: "invalid student id." });

    const event = await Event.findById(eventid);
    if (!event) return res.status(404).json({ error: "invalid event id." });

    // Check if already enrolled
    if (event.ParticipantId.includes(studentid)) {
      return res
        .status(409)
        .json({ error: "student is already enrolled in event." }); 
    }

    // Enroll student
    student.EventsParticipatedInId.push(eventid);
    student.NumberOfEventsParticipatedIn += 1;

    event.ParticipantId.push(studentid);
    event.NumberOfParticipantsTillNow += 1;

    await student.save();
    await event.save();

    res.status(200).json({ student, event }); // 200 OK
  } catch (error) {
    res.status(500).json({ error: "error in enrolling student in event." });
  }
}

async function sendVerificationOtp(req, res) {
  const { NameOfStudent, StudentEmail, StudentPassword } = req.body;

  if (!NameOfStudent || !StudentEmail || !StudentPassword) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  try {
    const existingStudent = await Student.findOne({ StudentEmail });
    if (existingStudent) {
      return res.status(409).json({ error: "Email already registered as a Student." });
    }

    const existingInstitution = await Institution.findOne({ InstitutionEmail: StudentEmail }); // <--- CORRECTED THIS LINE
    if (existingInstitution) {
      return res.status(409).json({ error: "Email already registered as an Institution." });
    }

    const otp = generateOtp();
    const HashedPassword = await bcrypt.hash(StudentPassword, 10);

    await Otp.findOneAndUpdate(
      { email: StudentEmail },
      {
        otp,
        name: NameOfStudent,
        password: HashedPassword,
      },
      { upsert: true, new: true, runValidators: true }
    );

    const emailResult = await sendOtpEmail(StudentEmail, otp);

    if (emailResult.success) {
      res
        .status(200)
        .json({ message: "OTP sent successfully. Please check your email." });
    } else {
      console.error("Error sending OTP email:", emailResult.error);
      res.status(500).json({ error: "Failed to send OTP email." });
    }
  } catch (error) {
    console.error("Error in sendVerificationOtp:", error);
    res.status(500).json({ error: "Error during the OTP sending process." });
  }
}

async function registerStudent(req, res) {
  const { StudentEmail, otp } = req.body;

  if (!StudentEmail || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }

  try {
    const otpRecord = await Otp.findOne({ email: StudentEmail, otp });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    if (!otpRecord.name || !otpRecord.password) {
      console.error("OTP record missing name or password:", otpRecord);
      return res
        .status(400)
        .json({
          error: "Incomplete OTP record. Please try registration again.",
        });
    }

    const existingStudent = await Student.findOne({ StudentEmail });
    if (existingStudent) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(409).json({ error: "Email already registered as a Student." });
    }
    
    const existingInstitution = await Institution.findOne({ InstitutionEmail: StudentEmail });
    if (existingInstitution) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(409).json({ error: "Email already registered as an Institution." });
    }

    const newStudent = await Student.create({
      NameOfStudent: otpRecord.name,
      StudentEmail: otpRecord.email,
      StudentPassword: otpRecord.password,
    });

    await Otp.deleteOne({ _id: otpRecord._id });

    await sendWelcomeEmailStudent(StudentEmail);

    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error in registerStudent:", error);
    res.status(500).json({ error: "Error in registering student." });
  }
}

module.exports = {
  studentmydetails,
  enrollstudentinevent,
  sendVerificationOtp,
  registerStudent,
};
