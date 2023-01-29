require('dotenv').config();
const express = require('express');
const dns = require('dns');
// add boy parser
const bodyParser = require('body-parser');
// add node-cache
const NodeCache = require("node-cache");
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// bodyParser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// node-cache
const cache = new NodeCache();

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// shorturl POST endpoint
app.post('/api/shorturl', function (req, res) {
  let regex = /^https?:\/\/(www\.)?[a-zA-Z0-9]+\.[a-zA-Z0-9]{2,}[\/\w-]*$/;

  let url = req.body.url.trim();
  if (regex.test(url)) {
    let short_url;
    const keys = cache.keys();
    if (!keys.length) {
      short_url = 0
      cache.set(short_url, url, 60 * 60 * 24);
    } else {
      let max = Math.max(...keys);
      short_url = ++max;
      cache.set(short_url, url, 60 * 60 * 24);
    }
    res.json({ original_url: url, short_url: short_url });

  } else {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  short_url = req.params.short_url;
  let original_url = cache.get(short_url);
  if (original_url) {
    res.redirect(original_url);
  } else {
    res.json({ error: "Short URL not found" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
