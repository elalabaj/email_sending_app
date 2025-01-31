const express = require('express');
const cors = require('cors')
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const port = 8000;
const uploadPath = path.join(__dirname, '..', 'uploads/');
const credentials = JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: credentials
});

app.use(express.json());
app.use(cors({origin: 'http://localhost:' + port}));
app.use(express.static('src/public'));
app.use(fileUpload());

app.get('/from', (req, res) => {
    res.json({ username: credentials.user });
});

app.post('/', async (req, res) => {
    try {
        let attachments = [];

        if (req.files) {
            let files = [];
            if (req.files.files.length > 1) for (const file of req.files.files) files.push(file);
            else files.push(req.files.files);
    
            await Promise.all(files.map(file => file.mv(uploadPath + file.name)));
            files.forEach(file => attachments.push({filename: file.name, path: uploadPath + file.name}));
        }
    
        const data = req.body;
        let mailOptions = {
            from: data.from,
            to: data.to,
            subject: data.subject,
            text: data.message,
            attachments: attachments
        };
    
        const info = await transporter.sendMail(mailOptions);
        console.log(info);

        res.json('Email sent succesfully!');
    }
    catch (err) {
        console.log(err);
        res.status(500).json('There was a problem with sending your email: ' + err.message);
    }
    finally {
        const files = await fs.promises.readdir(uploadPath);
        for (const file of files) fs.unlink(uploadPath + '/' + file, () => console.log(file, 'deleted'));
    }
});

app.listen(port, () => {
    console.log('listening on port', port);
});