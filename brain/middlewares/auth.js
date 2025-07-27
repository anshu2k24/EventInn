const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

async function authenticateinstitution(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(404).json({ error: "no token found." });
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.institutionid = decoded.institutionid;
    next();
  } catch (error) {
    res.status(401).json({error : "error in authenticatin institution."});
  }
}

async function authenticatestudent(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(404).json({ error: "no token found." });
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.studentid = decoded.studentid;
    next();
  } catch (error) {
    res.status(401).json({error : "error in authenticatin student."});
  }
}

module.exports = {
    authenticateinstitution,
    authenticatestudent
}
