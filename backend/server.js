// Import dependencies
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Initialize express app
const app = express();

// Use environment variable PORT or fallback to 3001
const PORT = process.env.PORT || 3001;

// CORS middleware: allow requests only from your frontend domain
app.use(
  cors({
    origin: 'https://officers-5.onrender.com', // your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: false, // set true only if you use cookies/auth
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

// POST endpoint to receive form submissions
app.post('/submit-form', async (req, res) => {
  // Destructure data from request body
  const { name, parent, phone, email, class: studentClass, message } = req.body;

  // Validate required fields
  if (!name || !parent || !phone || !studentClass) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create a nodemailer transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail email address
        pass: process.env.EMAIL_PASS, // Your Gmail app password
      },
    });

    // Setup email options
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
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Respond success to frontend
    res.status(200).json({ message: 'Enquiry submitted successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
