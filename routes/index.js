const express = require('express');
const router = express.Router();
const { generateRandomString } = require('../util/string');
const querystring = require('node:querystring');
const { search } = require('../services/search.service');
const { UnauthorizedError, ValidationError } = require('../services/exceptions');
const {
  spotifyAccountsHost, spotifyScope, spotifyCallbackUri, spotifyClientId, spotifyStateKey,
  sessionCookieName
} = require('../config');
const { authorizeSpotify, refreshSpotifyToken } = require('../services/auth.service');

const getSession = req => {
  const { session } = req.cookies;
  try {
    return JSON.parse(atob(session));
  } catch (e) {
    throw new UnauthorizedError('Invalid session');
  }
};

/* GET home page. */
router.get('/', async (req, res) => {

  const { query, offset, type = 'track,artist,album' } = req.query;

  try {
    const { access_token } = getSession(req);
    const results = await search(query, access_token, type, offset);
    res.render('index', { ...results });
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      console.error('Authentication error:', e);
      res.redirect('/login');
    } else if (e instanceof ValidationError) {
      console.error('Validation error:', e);
      res.render('index', { error: e.message });
    } else {
      console.error('Internal error:', e);
      res.render('index', { error: e.message });
    }
  }
});

router.get('/login', (req, res) => {

  const state = generateRandomString(16);
  res.cookie(spotifyStateKey, state);

  // Requests the authorization code from the Spotify Accounts service
  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: spotifyClientId,
    scope: spotifyScope,
    redirect_uri: spotifyCallbackUri,
    state
  });
  res.redirect(`${spotifyAccountsHost}/authorize?${queryParams}`);
});

router.get('/callback', async (req, res) => {

  // Request refresh and access tokens after validate the spotify state
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (!code || !state) {
    return res.render('index', { error: 'Invalid Spotify state' });
  }

  try {
    const session = await authorizeSpotify(code);
    res.cookie(sessionCookieName, btoa(JSON.stringify(session)), { httpOnly: true, sameSite: true });
    res.redirect('/');
  } catch (e) {
    console.error('Failed to get access token:', e);
    res.render('index', { error: 'Failed to complete the authentication with Spotify' });
  }
});

router.get('/refresh_token', (req, res) => {

  try {
    const { refresh_token } = getSession(req);
    console.log('Refreshing token', refresh_token);
    const session = refreshSpotifyToken(refresh_token);
    res.cookie(sessionCookieName, btoa(JSON.stringify(session)), { httpOnly: true, sameSite: true });
    res.redirect('/');
  } catch (e) {
    res.render('index', { error: e.message });
  }
});

module.exports = router;
