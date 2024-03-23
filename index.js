const express = require('express');
const fileUpload = require('express-fileupload');
const PDF2JSON = require('pdf2json');

const app = express();

app.use(fileUpload());

app.post('/upload', (req, res) => {
    if (!req.files || !req.files.pdf) {
        return res.status(400).send('No file uploaded.');
    }

    const pdfParser = new PDF2JSON();

    pdfParser.on('pdfParser_dataReady', pdfData => {
        const text = pdfData.formImage.Pages.map(page =>
            page.Texts.map(t => t.R[0].T).join(' ')
        ).join(' ');

        res.json({ text });
    });

    pdfParser.parseBuffer(req.files.pdf.data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
