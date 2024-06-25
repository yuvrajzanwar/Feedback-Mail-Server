const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASS
    }
});

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
    next();
});

// Default route
app.get('/', (req, res) => {
    res.send('Server started. You can use /contact to send a message.');
});

// Function to check message relevancy using Google AI
const isMessageRelevant = async (feedback, context) => {
    try {
        const prompt = `Please evaluate this message: "${feedback}" in the context of "${context}" to determine if it is relevant. 
        A relevant message is one that asks for an update, has a question/query, requests contact information, expresses interest in collaboration, comes from someone working on a project or product, originates from an organization, or offers a job or internship opportunity.
        Respond with 'yes' if it is relevant, otherwise 'no'.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const output = response.text().trim();
        console.log('Output:', output);
        return output.toLowerCase() === 'yes';
    } catch (error) {
        console.error('Error checking relevancy with GoogleAI:', error);
        return false;
    }
};

// Contact route for form submissions
app.post('/contact', async (req, res) => {
    const { name, email, feedback, context, receiverEmail } = req.body;

    // Validate request body
    if (!name || !email || !feedback || !context || !receiverEmail) {
        return res.status(400).send('Missing required fields: email, feedback, context, receiverEmail');
    }

    const relevant = await isMessageRelevant(feedback, context);
    console.log('POST request for /contact -', req.body);

    if (!relevant) {
        console.log('Message is not relevant');
        return res.status(400).send('Message is not relevant');
    }

    console.log('Message is relevant');

    const mailOptions = {
        from: {
            name: name, 
            address: process.env.EMAIL_USER
        },
        to: receiverEmail,
        subject: `Feedback message from ${name}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Feedback received</h2>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 5px;">
                <p style="font-size: 16px;"><b>Name:</b> ${name}</p>
                <p style="font-size: 16px;"><b>Email:</b> ${email}</p>
                <p style="font-size: 16px;"><b>Context:</b> ${context}</p>
                <p style="font-size: 16px;"><b>Message:</b></p>
                <p style="font-size: 16px; line-height: 1.6;">${feedback}</p>
            </div>
        </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send(error.toString());
        }
        console.log('Email sent:', info.response);
        res.status(200).send('Message sent: ' + info.response);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
