const express = require('express');
const request = require('request');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ /swap endpoint
app.post('/swap', function (req, res) {
  const code = req.body.code || req.query.code;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded', // ✅ required!
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.json(body);
    } else {
      console.error('Token swap failed:', error, body);
      res.status(response?.statusCode || 500).json(body);
    }
  });
});

// ✅ /refresh endpoint
app.post('/refresh', function (req, res) {
  const refresh_token = req.body.refresh_token || req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    headers: {
      Authorization:
        'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded', // ✅ required!
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.json(body);
    } else {
      console.error('Token refresh failed:', error, body);
      res.status(response?.statusCode || 500).json(body);
    }
  });
});

// ✅ Health check at correct route
app.get('/swap', (req, res) => {
  res.status(200).send('Swap endpoint is live');
});

app.get('/refresh', (req, res) => {
  res.status(200).send('Refresh endpoint is live');
});

app.get('/testSpotifyConnection', (req, res) => {
  request('https://accounts.spotify.com/api/token', (error, response) => {
    if (error) {
      return res.status(500).send(`Failed: ${error.message}`);
    }
    res.status(200).send(`Response code: ${response.statusCode}`);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
