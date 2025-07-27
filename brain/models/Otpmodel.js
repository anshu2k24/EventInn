const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true, // Ensures one pending OTP per email
        },
        otp: {
            type: String, // Storing as a string is often better to handle leading zeros
            required: true,
        },
        name: { // <--- ENSURE THIS FIELD IS PRESENT
            type: String,
            required: true,
        },
        password: { // <--- ENSURE THIS FIELD IS PRESENT (stores the HASHED password)
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300, // MongoDB will automatically delete documents after 300 seconds (5 minutes)
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

otpSchema.index({ email: 1 });

module.exports = mongoose.model("Otp", otpSchema);