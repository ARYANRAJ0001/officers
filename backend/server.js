const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware setup
app.use(cors({
  origin: '*', // Change this to your frontend domain in production
  methods: ['GET', 'POST'],
  credentials: true
}));

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
        pass: process.env.EMAIL_PASS  // Your Gmail app password
      }
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('Nodemailer transporter verified and ready');

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
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

// Handle all other routes by serving the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
