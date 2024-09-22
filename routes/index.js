const express = require('express');
const { generateRandomString } = require('../util/string');
const querystring = require('node:querystring');
const request = require('request');
const { getUserInfo } = require('../services/auth.service');
const { search } = require('../services/search.service');
const router = express.Router();

const stateKey = 'spotify_auth_state';
const client_id = '9aa423e0cf6446b39dfad77ba6e6cd2e'; // your clientId
const client_secret = '12ecf3a8aeb74b1c834943c6a0504b18'; // Your secret
const redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

/* GET home page. */
router.get('/', async (req, res) => {

  const { session } = req.cookies;
  const { access_token } = JSON.parse(atob(session));

  try {
    const userInfo = await getUserInfo(access_token);
    res.render('index', { userInfo });
  } catch (e) {
    console.error('Authentication error:', e);
    res.render('index');
  }
});

router.post('/', async (req, res) => {

  const { query } = req.body;
  const { session } = req.cookies;
  const { access_token } = JSON.parse(atob(session));

  try {
    const results = await search(query, access_token);
    res.render('index', results);
  } catch (e) {
    console.error('Error searching:', e);
    res.render('index', { searchError: e.message });
  }
});

router.get('/login', (req, res) => {

  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  const scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
      state
    }));
});

router.get('/callback', (req, res) => {

  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code,
        redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, async (error, response, body) => {
      if (!error && response.statusCode === 200) {

        // use the access token to access the Spotify Web API
        res.cookie('session', btoa(JSON.stringify(body)), { httpOnly: true, sameSite: true });
        res.redirect('/');
      } else {
        res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
      }
    });
  }
});

router.get('/refresh_token', (req, res) => {

  const refresh_token = req.query.refresh_token;

  console.log('refreshing token', refresh_token);

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const { access_token, refresh_token } = body;
      res.send({ access_token, refresh_token });
    }
  });
});

module.exports = router;
