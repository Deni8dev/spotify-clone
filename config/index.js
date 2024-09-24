// Spotify Client ID and Secret
require('dotenv').config()

module.exports = {
	spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
	spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
	spotifyScope:
		'user-read-private user-read-email user-library-read user-library-modify',
	spotifyCallbackUri: 'http://localhost:3000/callback',
	spotifyAccountsHost: 'https://accounts.spotify.com',
	spotifyApiHost: 'https://api.spotify.com',
	spotifyStateKey: 'spotify_auth_state',
	sessionCookieName: 'session'
}
