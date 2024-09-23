// Spotify Client ID and Secret
const client_id = '9aa423e0cf6446b39dfad77ba6e6cd2e';
const client_secret = '12ecf3a8aeb74b1c834943c6a0504b18';

const DEFAULT_CALLBACK_URI = 'http://localhost:3000/callback';
const DEFAULT_SCOPE = 'user-read-private user-read-email user-library-modify';

module.exports = {
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID || client_id,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || client_secret,
  spotifyScope: process.env.SPOTIFY_SCOPE || DEFAULT_SCOPE,
  spotifyCallbackUri: process.env.SPOTIFY_CALLBACK_URI || DEFAULT_CALLBACK_URI,
  spotifyAccountsHost: 'https://accounts.spotify.com',
  spotifyApiHost: 'https://api.spotify.com',
  spotifyStateKey: 'spotify_auth_state',
  sessionCookieName: 'session'
};
