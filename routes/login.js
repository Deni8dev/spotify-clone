const express = require('express')
const router = express.Router()
const { generateRandomString } = require('../util/string')
const querystring = require('node:querystring')
const { UnauthorizedError } = require('../services/exceptions')
const {
	spotifyAccountsHost,
	spotifyScope,
	spotifyCallbackUri,
	spotifyClientId,
	spotifyStateKey,
	sessionCookieName
} = require('../config')
const {
	authorizeSpotify,
	refreshSpotifyToken
} = require('../services/auth.service')

const getSession = (req) => {
	const { session } = req.cookies
	try {
		return JSON.parse(atob(session))
	} catch (e) {
		throw new UnauthorizedError('Invalid session')
	}
}

router.get('/login', (req, res) => {
	const state = generateRandomString(16)
	res.cookie(spotifyStateKey, state)

	// Requests the authorization code from the Spotify Accounts service
	const queryParams = querystring.stringify({
		response_type: 'code',
		client_id: spotifyClientId,
		scope: spotifyScope,
		redirect_uri: spotifyCallbackUri,
		state
	})
	res.redirect(`${spotifyAccountsHost}/authorize?${queryParams}`)
})

router.get('/callback', async (req, res) => {
	// Request refresh and access tokens after validate the spotify state
	const code = req.query.code || null
	const state = req.query.state || null

	if (!code || !state) {
		return res.render('index', { error: 'Invalid Spotify state' })
	}

	try {
		const session = await authorizeSpotify(code)
		res.cookie(sessionCookieName, btoa(JSON.stringify(session)), {
			httpOnly: true,
			sameSite: true
		})
		res.redirect('/')
	} catch (e) {
		console.error('Failed to get access token:', e)
		res.render('index', {
			error: 'Failed to complete the authentication with Spotify'
		})
	}
})

router.get('/refresh_token', (req, res) => {
	try {
		const { refresh_token } = getSession(req)
		console.log('Refreshing token', refresh_token)
		const session = refreshSpotifyToken(refresh_token)
		res.cookie(sessionCookieName, btoa(JSON.stringify(session)), {
			httpOnly: true,
			sameSite: true
		})
		res.redirect('/')
	} catch (e) {
		res.render('index', { error: e.message })
	}
})

module.exports = router
