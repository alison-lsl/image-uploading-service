const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');

const db = require('./models/database.js');
const {zipFileName} = require('./middleware/functions.js');

const app = express();
const img_folder_path = 'uploads';
const port = 3000

const min_file_size = 100 * 1024 // 102400 Bytes = 100 KB
const max_file_size = 300 * 1024 // 302400 Bytes = 300 KB
let default_file_size = min_file_size // 102400 Bytes = 100 KB

// enable CORS
app.use(cors());

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// serving static files
app.use(express.static(img_folder_path));

// request handlers
app.get('/', function (req, res) {
  res.send('Hello World! Upload a file please.');
});

// handle storage with multer
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, img_folder_path));
    },
    filename: function (req, file, callback) {
        const file_name = `${file.originalname.replace(' ', '_')}`;
        callback(null, file_name)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (req.body.size_limit <= max_file_size && req.body.size_limit >= min_file_size) {
            default_file_size = req.body.size_limit;
        }
        else {
            callback(null, false);
            return callback (new Error (`Specify the custom image file size limit between 100 KB and 300 KB.`))
        }
        if (!file.mimetype.startsWith("image")) {
            callback(null, false);
            return callback (new Error ('Only images are allowed.'))
        }
        else {
            callback(null, true);
        }
    },
    limits: {
        fileSize: default_file_size
    }
});

app.post('/upload-file', upload.single('file'), (req, res, next) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send({ 
            message: 'Please upload a file.' 
        });
    }

    img_array = [{
        'name' : file.filename,
        'extension' : file.mimetype,
        'image' : fs.readFileSync(path.join(__dirname, img_folder_path, file.filename))
    }]

    db.insertImageData(img_array);
    return res.send({ message: 'File uploaded successfully.', file });
},
(error, req, res, next) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send({
            message : "The image file is too large."
        })
    }
    else if (error) {
        return res.status(400).send({
            message : error.message
        })
    }
});

app.get('/show-history', (req, res) => {
    db.showHistory().then(data => {
            res.send({ message: 'Image Upload History', data});
        }
    ).catch(err => {
        res.status(400).send({
            message: err.message
        });
    });
});

app.get('/get-image', upload.none(), (req, res) => {
    var zip = new JSZip();
    let image_id = JSON.parse(req.body.id);

    db.getImagesById(image_id).then(
        data => {
            if (data.length === 0) {
                return res.send({message: "No image(s) found in DB for downloading."});
            }
            else if (data.length === 1) {
                if (fs.existsSync(path.join(__dirname, img_folder_path, data[0].name))) {
                    return res.download(path.join(__dirname, img_folder_path, data[0].name), err => {
                        if (err) {
                            return res.status(500).send({
                                message: err.message
                            });
                        }
                    });
                }
            }
            else {
                var image_zip = zip.folder('images');
                data.forEach(image_data => {
                    image_zip.file(image_data.name, image_data.image);
                });

                image_zip.generateAsync({type:"base64", mimeType: "application/zip"}).then(
                    base64 => {
                        let zip_data = Buffer.from(base64, "base64");
                        res.writeHead(200, {
                            'Content-Type' : "application/zip",
                            "Content-Disposition" : `attachment; filename=${zipFileName('yyyymmdd')}.zip`
                        })
                        res.end(zip_data);
                    }
                ).catch(err => res.status(500).send({message: err.message}));
            }
        }).catch(err => {
            return res.status(400).send({
                message: err.message
            });
        });

    
});

app.get('/search-image-url', (req, res) => {
    let image_name = req.query.image_name;

    if (!image_name) {
        return res.status(400).send({
            message: "Please provide an image name."
        });
    }
    db.getImagesByName(image_name.toLowerCase()).then(
        data => {
            if (data.length > 0) {
                let links_array = data.map(link => {
                    if (fs.existsSync(path.join(__dirname, img_folder_path, link.name))) {
                        return {'link' : req.protocol + '://' + req.get('host') + '/' + link.name};
                    }
                    return {'link' : `Sorry. ${link.name} can't be found in the static folder.`}
                });
                return links_array;
            }
            return [];
        }
    ).then(
        links => {
            if (links.length > 0) {
                return res.send({message: `Image(s) found for '${image_name}' in DB.`, links: links});
            }
            return res.send({message: `Image(s) not found for '${image_name}' in DB.`});
        }
    ).catch(err => {
        res.status(400).send({
            message: err.message
        });
    });
});

app.delete('/reset-history', (req, res) => {
    db.truncateTable();
    return res.send({ message: 'Image history reset successfully.'});
});

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});