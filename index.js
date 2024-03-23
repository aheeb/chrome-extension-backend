const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');

const app = express();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
