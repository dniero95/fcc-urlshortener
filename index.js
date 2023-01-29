require('dotenv').config();
const express = require('express');
const dns = require('dns');
// validete the url
const validUrl = require('valid-url');
// add body parser
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

  let url = req.body.url.trim();

  if (validUrl.isUri(url)) {
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


// shorturl GET get endpoint
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
