const { exec } = require('child_process');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const { Client } = require('pg');
const client = new Client({
  database: 'cag'
});
client.connect();

var app = express();

app.use(cors());
app.use(compression());
app.use(fileUpload());
app.use(express['static'](__dirname + '/static'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/csv/:mapid', (req, res) => {
  let mapid = req.params.mapid * 1;
  client.query('SELECT * FROM "target_' + mapid + '" LIMIT 10', (err, response) => {
    if (err) {
      return res.send('CSV is being uploaded... please refresh this page in a few minutes')
    }
    res.render('csv', {
      rows: response.rows,
      mapid: mapid
    });
  });
});

app.post('/set_cols', (req, res) => {
  let x_col = req.body.x.replace(/\\/g, '').replace(/"/g, ''),
      y_col = req.body.y.replace(/\\/g, '').replace(/"/g, ''),
      mapid = req.body.mapid * 1;
  client.query('ALTER TABLE "target_' + mapid + '" RENAME "' + x_col + '" TO coord_x_final', (err) => {
    if (err) {
      return res.json(err);
    }
    client.query('ALTER TABLE "target_' + mapid + '" RENAME "' + y_col + '" TO coord_y_final', (err) => {
      if (err) {
        return res.json(err);
      }
      res.redirect('/map/' + mapid);
    });
  });
});

app.get('/map/:mapid', (req, res) => {
  let mapid = req.params.mapid * 1;
  client.query('SELECT coord_x_final, coord_y_final FROM "target_' + mapid + '"', (err, response) => {
    if (err) {
      return res.json(err);
    }
    res.render('map', {
      rows: response.rows
    });
  });
});

app.get('/api', (req, res) => {
  let x_val = req.query.x * 1,
      y_val = req.query.y * 1,
      mapid = req.query.mapid * 1;
  let q = 'SELECT * FROM "target_' + mapid + '" WHERE ABS(coord_x_final - ' + x_val + ') < 0.00001 AND ABS(coord_y_final - ' + y_val + ') < 0.00001';
  client.query(q, (err, data) => {
    res.json(err || data.rows);
  });
});

app.get('/upload', (req, res) => {
  res.render('form');
});

app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let sampleFile = req.files.document;
  let mapid = Math.random();
  let tmpf = './uploads/target_' + mapid + '.csv';
  sampleFile.mv(tmpf, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/csv/' + mapid);

    exec('csvsql --db postgresql:///cag ' + tmpf + ' --insert', (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        return;
      }

      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log('app is running');
});

module.exports = app;
