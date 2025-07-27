const crypto = require('crypto');

/**
 * Generates a random 6-digit numeric OTP.
 * @returns {string} The generated OTP as a string.
 */
const generateOtp = () => {
    // Generate a cryptographically strong random number.
    // The range is from 100000 (inclusive) to 1000000 (exclusive),
    // which ensures a 6-digit number.
    const otp = crypto.randomInt(100000, 1000000);
    
    // Return the number as a string.
    // This is good practice to prevent issues with leading zeros,
    // though this specific function won't generate them.
    return otp.toString();
};

module.exports = {
    generateOtp,
};