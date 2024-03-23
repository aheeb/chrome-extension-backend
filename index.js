const express = require('express');
const fileUpload = require('express-fileupload');
const PDFParser = require('pdf2json');

const app = express();

app.use(fileUpload());

app.post('/upload', (req, res) => {
    if (!req.files || !req.files.pdf) {
        return res.status(400).send('No file uploaded.');
    }

    const pdfParser = new PDFParser();
    let outputText = '';

    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
        if (pdfData.formImage && pdfData.formImage.Pages) {
            pdfData.formImage.Pages.forEach(page => {
                if (page.Texts) {
                    page.Texts.forEach(text => {
                        outputText += decodeURIComponent(text.R[0].T) + ' ';
                    });
                }
            });
        }

        res.json({ text: outputText });
    });

    pdfParser.parseBuffer(req.files.pdf.data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
