const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const dotenv = require('dotenv');
const app = express();
require('dotenv').config();

app.use(fileUpload());

app.post('/upload', (req, res) => {
    if (!req.files || !req.files.pdf) {
        return res.status(400).send('No file uploaded.');
    }

    let dataBuffer = req.files.pdf.data;

    pdfParse(dataBuffer).then(function (data) {
        // data.text contains the extracted text from the PDF
        res.json({ text: data.text });
    }).catch(error => {
        console.error('Error:', error);
        res.status(500).send('Error processing PDF');
    });
});

app.use(bodyParser.json());
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));
const { Pool } = require('pg');

// PostgreSQL connection settings
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: 5432, // Default PostgreSQL port
    // For Render or other cloud providers, you might need to add SSL settings
    ssl: {
        rejectUnauthorized: false // depends on your SSL configuration
    }
});

// Handle registration
// Handle registration
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
            [email, hashedPassword]
        );
        // The user is registered, handle the result as needed
        res.json({ status: 'success', userId: result.rows[0].id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', message: 'Error registering user' });
    }
});

// Handle login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT id, password FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                req.session.user = user.id; // Set user session
                res.json({ status: 'success', userId: user.id });
            } else {
                res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ status: 'error', message: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', message: 'Error logging in' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
