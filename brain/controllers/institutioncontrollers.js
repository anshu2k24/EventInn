const institution = require("../models/Institutionmodel");
const event = require("../models/Eventmodel");
const bcrypt = require("bcryptjs");

async function institutionmydetails(req, res) {
  const institutionid = req.institutionid;
  try {
    const instituionbyid = await institution.findById(institutionid);
    if (!instituionbyid)
      return res.status(404).json({ error: "invalid institution id." });
    res.status(200).json(instituionbyid);
  } catch (error) {
    res.status(500).json({ error: "error in fetching institution details." });
  }
}

async function addinstitution(req, res) {
  const { NameOfInstitution, InstitutionEmail, InstitutionPassword } = req.body;
  try {
    const existing = await institution.findOne({ InstitutionEmail });
    if (existing)
      return res.status(409).json({ error: "email already registered." }); // 409 Conflict
    const HashedPassword = await bcrypt.hash(InstitutionPassword, 10);
    const newInstitution = await institution.create({
      NameOfInstitution,
      InstitutionEmail,
      InstitutionPassword: HashedPassword,
    });
    res.status(201).json(newInstitution);
  } catch (error) {
    res.status(500).json({ error: "error in registering institution." });
  }
}

async function addevent(req, res) {
  const { NameOfEvent, EventDescription, StartDateOfEvent, EndDateOfEvent } = req.body;
  const institutionid = req.institutionid;
  try {
    const hostinstitution = await institution.findById(institutionid);
    if (!hostinstitution)
      return res.status(404).json({ error: "invalid institution id." });
    const existing = await event.findOne({
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
    const newEvent = await event.create({
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
  const { NameOfEvent, EventDescription, StartDateOfEvent, EndDateOfEvent } = req.body;
  const eventid = req.params.eventid;
  const institutionid = req.institutionid;
  try {
    const hostinstitution = await institution.findById(institutionid);
    if (!hostinstitution)
      return res.status(404).json({ error: "invalid institution id." });

    const eventtoupdate = await event.findById(eventid);
    if (!eventtoupdate)
      return res.status(404).json({ error: "invalid event id." });

    if (hostinstitution.InstitutionEmail === eventtoupdate.HostInstitutionEmail) {
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
      return res.status(403).json({ error: "cannot update events not hosted by your institution." }); // 403 Forbidden
    }
  } catch (error) {
    res.status(500).json({ error: "error in updating event." });
  }
}

async function getallevents(req, res) {
  try {
    const events = await event.find();
    res.status(200).json(events); // 200 OK
  } catch (error) {
    res.status(500).json({ error: "error in fetching all events." });
  }
}

module.exports = {
  addinstitution,
  addevent,
  getallevents,
  institutionmydetails,
  updateevent,
};
