const {
	spotifyApiHost,
	spotifyAccountsHost,
	spotifyCallbackUri,
	spotifyClientId,
	spotifyClientSecret
} = require('../config')
const { UnauthorizedError } = require('./exceptions')

const AUTH_TOKEN = new Buffer.from(
	`${spotifyClientId}:${spotifyClientSecret}`
).toString('base64')

module.exports = {
	authorizeSpotify: async (spotifyCode) => {
		const options = {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${AUTH_TOKEN}`
			},
			body: `grant_type=authorization_code&code=${spotifyCode}&redirect_uri=${spotifyCallbackUri}`,
			json: true
		}

		const response = await fetch(`${spotifyAccountsHost}/api/token`, options)

		if (!response.ok) {
			throw new UnauthorizedError('Failed to get access tokens')
		}

		const data = await response.json()
		console.log('Got access and refresh tokens:', data)

		return data
	},

	refreshSpotifyToken: async (refresh_token) => {
		console.log('Refreshing token', refresh_token)

		const options = {
			method: 'POST',
			url: `${spotifyAccountsHost}/api/token`,
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${AUTH_TOKEN}`
			},
			form: {
				grant_type: 'refresh_token',
				refresh_token
			},
			json: true
		}

		const response = await fetch(`${spotifyAccountsHost}/api/token`, options)

		if (!response.ok) {
			throw new UnauthorizedError('Failed to refresh access token')
		}

		const data = await response.json()
		console.log('Refreshed access and refresh tokens:', data)

		return data
	},

	getUserInfo: async (access_token) => {
		const options = { headers: { Authorization: `Bearer ${access_token}` } }
		const response = await fetch(`${spotifyApiHost}/v1/me`, options)
		const { error, display_name, images } = await response.json()

		if (error && error.status === 401)
			throw new UnauthorizedError(error.message)

		return {
			display_name,
			image: images.find((img) => img.height === 64)?.url
		}
	}
}
