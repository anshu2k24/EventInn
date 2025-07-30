const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        otp: {
            type: String,
            required: true,
        },
        name: { 
            type: String,
            required: true,
        },
        password: { 
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300, 
        },
    },
    {
        timestamps: true, 
    }
);

otpSchema.index({ email: 1 });

module.exports = mongoose.model("Otp", otpSchema);