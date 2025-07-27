const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // Use 'true' for port 465, 'false' for other ports like 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// To test transporter connection on application startup
transporter.verify((err, success) => {
  if (err) {
    console.log("Error in connecting to SMTP:", err.message);
  } else {
    console.log("Successfully connected to SMTP. Ready to send emails.");
  }
});

// Function to send the OTP email (remains unchanged)
const sendOtpEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"EventInn" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your EventInn OTP Code 🔐",
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your <strong>EventInn</strong> OTP code is:</p><h2>${otp}</h2><p>This code is valid for 5 minutes. Don’t share it with anyone.</p>`,
    });
    console.log(`OTP email sent to ${email}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    return { success: false, error: error.message };
  }
};

// NEW: Function to send the welcome email specifically for students
const sendWelcomeEmailStudent = async (email) => {
  try {
    const info = await transporter.sendMail({
      from: `"EventInn" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "You're In 🎉 Welcome to EventInn!",
      text: `Hey there 👋

Welcome to EventInn — your personal gateway to everything happening on campus (and beyond).

We’re stoked to have you here 🎉

From hackathons and open mics to workshops and food fests, EventInn connects you to events you actually care about — hosted by institutions, clubs, and student leaders across your city. Whether you're looking to build your network, learn something new, or just vibe out with a crowd, we got you.

No more missed events. No more FOMO. You’re officially plugged into the student scene.

See you at the next big thing ✌️
– The EventInn Team 🚀
`,
      html: `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 32px;">
  <div style="max-width: 600px; background: white; margin: auto; padding: 32px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.05);">
    <h2 style="color: #1d4ed8;">Welcome to EventInn 🎉</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Hey there 👋<br><br>
      Welcome to <strong>EventInn</strong> — your personal gateway to everything happening on campus (and beyond). We're stoked to have you here!
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      From <strong>hackathons</strong> and <strong>open mics</strong> to <strong>workshops</strong> and <strong>food fests</strong>, EventInn connects you to events you actually care about — hosted by institutions, clubs, and student leaders across your city.
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Whether you're looking to <em>build your network</em>, <em>learn something new</em>, or just <em>vibe out with a crowd</em>, we got you.
    </p>
    <p style="font-size: 16px; color: #333;">
      No more missed events. No more FOMO. You’re officially plugged into the student scene.
    </p>
    <p style="font-size: 14px; color: #6b7280;">See you at the next big thing ✌️<br>– The EventInn Team 🚀</p>
  </div>
</div>
`,
    });
    console.log(`Student welcome email sent to ${email}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending student welcome email:", error.message);
    return { success: false, error: error.message };
  }
};

// NEW: Function to send the welcome email specifically for institutions
const sendWelcomeEmailInstitution = async (email) => {
  try {
    const info = await transporter.sendMail({
      from: `"EventInn" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome Aboard, Partner! 🎉 EventInn for Institutions",
      text: `Hello there!

Welcome to EventInn, your new platform for connecting with students and managing your events!

We're thrilled to have your institution join our growing community. EventInn makes it easy to:
- Create and promote events effortlessly.
- Reach a wider student audience.
- Track registrations and manage participants.

We're here to help you make your campus events a huge success. Explore your dashboard and start creating your first event today!

If you have any questions, our support team is ready to assist.

Best regards,
The EventInn Team 🚀
`,
      html: `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 32px;">
  <div style="max-width: 600px; background: white; margin: auto; padding: 32px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.05);">
    <h2 style="color: #1d4ed8;">Welcome Aboard, Partner! 🎉</h2>
    <h3 style="color: #1d4ed8;">EventInn for Institutions</h3>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Hello there!<br><br>
      Welcome to <strong>EventInn</strong>, your new platform for connecting with students and managing your events!
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      We're thrilled to have your institution join our growing community. EventInn makes it easy to:
      <ul>
        <li style="margin-bottom: 8px;">✅ Create and promote events effortlessly.</li>
        <li style="margin-bottom: 8px;">✅ Reach a wider student audience.</li>
        <li>✅ Track registrations and manage participants.</li>
      </ul>
    </p>
    <p style="font-size: 16px; color: #333;">
      We're here to help you make your campus events a huge success. Explore your dashboard and start creating your first event today!
    </p>
    <p style="font-size: 16px; color: #333;">
      If you have any questions, our support team is ready to assist.
    </p>
    <p style="font-size: 14px; color: #6b7280;">Best regards,<br>– The EventInn Team 🚀</p>
  </div>
</div>
`,
    });
    console.log(`Institution welcome email sent to ${email}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending institution welcome email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
  sendWelcomeEmailStudent, // Export the student-specific welcome email
  sendWelcomeEmailInstitution, // Export the institution-specific welcome email
};
