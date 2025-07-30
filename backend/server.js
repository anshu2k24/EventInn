const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors');

const eventinnroutes = require("./routes/eventinnroutes")

dotenv.config();

const port = process.env.PORT || 3000 ; 

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', // frontend URL
    credentials: true // only needed if you're using cookies
  }));

app.use("/services",eventinnroutes);

mongoose.connect(
    process.env.MONGO_URI
).then (()=>{
    console.log("Connected to MongoDb"),
    app.listen(port,()=>{
        console.log(`Listening to ${port}`);
    })
}).catch((error)=>{
    console.error("error occured in connecting to mongodb: ",error.message);
})