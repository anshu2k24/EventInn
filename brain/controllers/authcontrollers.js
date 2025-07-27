const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Studentmodel");
const Institution = require("../models/Institutionmodel");
const dotenv = require("dotenv");

dotenv.config();

async function loginstudent(req,res){
    const {StudentEmail,StudentPassword} = req.body;
    try {
        const student = await Student.findOne({StudentEmail});
        if(!student) return res.status(400).json({error : "invalid email or password"});
        const ismatch = await bcrypt.compare(StudentPassword,student.StudentPassword);
        if(!ismatch) return res.status(400).json({error : "invalid email or password"});
        const token = jwt.sign({studentid:student._id},process.env.JWT_SECRET, {expiresIn : '5m'});
        res.json({token});
    } catch (error) {
        res.status(500).json({error : "error in student loging in."});
    }
}

async function logininstitution(req,res){
    const {InstitutionEmail, InstitutionPassword} = req.body;
    try {
        const institution = await Institution.findOne({InstitutionEmail});
        if(!institution) return res.status(400).json({error : "invalid email or password"});
        const ismatch = await bcrypt.compare(InstitutionPassword,institution.InstitutionPassword);
        if(!ismatch) return res.status(400).json({error : "invalid email or password"});
        const token = jwt.sign({institutionid:institution._id},process.env.JWT_SECRET, {expiresIn : '5m'});
        res.json({token});
    } catch (error) {
        res.status(500).json({error : "error in institution loging in."});
    }
}

module.exports = {
    loginstudent,
    logininstitution
}