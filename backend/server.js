// server.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware setup
// For production, replace '*' with your frontend domain like 'https://officers-5.onrender.com'
app.use(cors({
  origin: '*', // Change this to your frontend domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// POST route to handle form submissions
app.post('/submit-form', async (req, res) => {
  console.log('Received form data:', req.body);

  const { name, parent, phone, email, class: studentClass, message } = req.body;

  // Validate required fields
  if (!name || !parent || !phone || !studentClass) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create transporter with Gmail service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail app password (NOT your Gmail password)
      }
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('Nodemailer transporter verified and ready');

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER, // Receiver email address
      subject: 'New Admission Enquiry',
      text: `
Student's Name: ${name}
Parent's Name: ${parent}
Phone: ${phone}
Email: ${email || 'N/A'}
Class: ${studentClass}
Message: ${message || 'N/A'}
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    // Respond success to frontend
    res.status(200).json({ message: 'Enquiry submitted successfully' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
