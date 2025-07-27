const Student = require("../models/Studentmodel");
const Event = require("../models/Eventmodel");
const bcrypt = require("bcryptjs");

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

async function addstudent(req, res) {
  const { NameOfStudent, StudentEmail, StudentPassword } = req.body;
  try {
    const existing = await Student.findOne({ StudentEmail });
    if (existing)
      return res.status(409).json({ error: "email already registered." }); // 409 Conflict

    const HashedPassword = await bcrypt.hash(StudentPassword, 10);
    const newStudent = await Student.create({
      NameOfStudent,
      StudentEmail,
      StudentPassword: HashedPassword,
    });
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: "error in registering student." });
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
      return res.status(409).json({ error: "student is already enrolled in event." }); // 409 Conflict
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

module.exports = {
  addstudent,
  enrollstudentinevent,
  studentmydetails,
};
