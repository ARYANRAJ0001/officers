const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // More secure CORS configuration
  methods: ['GET', 'POST'],
  credentials: true
}));

// Improved body parsing and static serving
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '../officeracademy/build'))); // Adjusted path for React build

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Enhanced form validation middleware
const validateFormData = (req, res, next) => {
  const { name, parent, phone, class: studentClass } = req.body;
  const phoneRegex = /^[0-9]{10}$/;

  if (!name || !parent || !phone || !studentClass) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  if (!phone.match(phoneRegex)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  next();
};

// POST route with improved validation and email template
app.post('/submit-form', validateFormData, async (req, res) => {
  try {
    const { name, parent, phone, email, class: studentClass, message } = req.body;

    const mailOptions = {
      from: `"Officer Academy" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: 'New Admission Enquiry',
      html: `
        <h3>New Admission Enquiry</h3>
        <p><strong>Student's Name:</strong> ${name}</p>
        <p><strong>Parent's Name:</strong> ${parent}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Class:</strong> ${studentClass}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        <hr>
        <p>Sent from Officer Academy website</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Enquiry submitted successfully' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Serve React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../officeracademy/build', 'index.html'));
});

// Server initialization
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
