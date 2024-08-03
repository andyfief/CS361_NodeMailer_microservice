const express = require('express');
const bodyParser = require('body-parser');
const { sendEmails } = require('./mailer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const saveResultsToFile = (results) => {
    const filePath = path.join(__dirname, 'resultsEx.json');
    fs.writeFileSync(filePath, JSON.stringify({ results }, null, 2), 'utf8');
};

// Endpoint to receive email requests
app.post('/send-emails', async (req, res) => {
    const { emails, subject, message, transporter } = req.body;

    if (!emails || !subject || !message || !transporter) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        saveResultsToFile(results);
        const results = await sendEmails(transporter, emails, subject, message);
        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to read from local JSON file and send request
app.get('/test-local-json', async (req, res) => {
    try {
        const jsonFilePath = path.join(__dirname, 'test-emails.json');
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const requestData = JSON.parse(jsonData);
        
        const { emails, subject, message, transporter } = requestData;

        const results = await sendEmails(transporter, emails, subject, message);
        saveResultsToFile(results);
        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Email microservice listening at http://localhost:${port}`);
});