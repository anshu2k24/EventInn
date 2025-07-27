const express = require("express");
const router = express.Router();
const {addstudent,enrollstudentinevent,studentmydetails} = require("../controllers/studentcontrollers.js")
// const {addstudent,loginstudent,enrollstudentinevent} = require("../controllers/studentcontrollers.js")
const {addinstitution,addevent,getallevents,institutionmydetails,updateevent} = require("../controllers/institutioncontrollers.js")
const {loginstudent,logininstitution} = require("../controllers/authcontrollers.js")
const {authenticateinstitution,authenticatestudent} = require("../middlewares/auth")

//student section
//registration
router.post("/student/reg", addstudent);
//login
router.post("/student/login", loginstudent);
//enroll in event
router.patch("/student/enroll/:eventid",authenticatestudent,enrollstudentinevent);
//student dashboard
router.get("/student/mypage",authenticatestudent,studentmydetails)


//institution section
//registration
router.post("/institution/reg", addinstitution);
//login
router.post("/institution/login", logininstitution);
//add event
router.post("/institution/addevent",authenticateinstitution,addevent);
//update event
router.patch("/institution/updateevent/:eventid",authenticateinstitution,updateevent);
//add event with 1 collaborator institute
// router.post("/institution/addevent",authenticateinstitution,addevent);
//institution dashboard
router.get("/institution/mypage",authenticateinstitution,institutionmydetails)
//all events
router.get("/", getallevents);

module.exports = router;