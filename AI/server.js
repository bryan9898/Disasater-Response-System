//node server.js
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const port = 5000; 

app.use(cors());
app.use(express.json());

app.post('/checkdisaster', (req, res) => {
    const { description } = req.body;
    const command = `py checkDisaster.py "${description}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send({ message: 'Error running prediction' });
        }

        // Parse the stdout to a format your frontend expects
        res.json({ prediction: stdout.trim() });
    });
});


const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/classifyImage', upload.single('image'), (req, res) => {
    const imgPath = req.file.path; // The path to the uploaded file

    const command = `set PYTHONIOENCODING=utf-8 && python classifyImage.py "${imgPath}"`;
    console.log("Executing command:", command);

    exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send({ message: 'Error running image classification', error: error.message, stderr });
        }

        console.log(`stdout: ${stdout}`);
        res.json({ classification: stdout.trim() });
    });

});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
