const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Backend is running');
});


// POST route for form submission
app.post('/submit-form', async (req, res) => {
    const { name, parent, phone, email, class: studentClass, message } = req.body;

    if (!name || !parent || !phone || !studentClass) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Setup nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail address
                pass: process.env.EMAIL_PASS  // Your Gmail app password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER, // where to receive form submissions
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

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Enquiry submitted successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

