const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'officersacademy', 'public')));


// POST route for form submission
app.post('/submit-form', async (req, res) => {
    const { name, parent, phone, email = 'N/A', class: studentClass, message = 'N/A' } = req.body;

    if (!name || !parent || !phone || !studentClass) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
            subject: 'New Admission Enquiry',
            text: `
                Student's Name: ${name}
                Parent's Name: ${parent}
                Phone: ${phone}
                Email: ${email}
                Class: ${studentClass}
                Message: ${message}
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Enquiry submitted successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'officersacademy', 'public', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


