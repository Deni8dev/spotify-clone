const express = require('express')
const router = express.Router()
const { search } = require('../services/search.service')
const { UnauthorizedError, ValidationError } = require('../services/exceptions')

const getSession = (req) => {
	const { session } = req.cookies
	try {
		return JSON.parse(atob(session))
	} catch (e) {
		throw new UnauthorizedError('Invalid session')
	}
}

router.get('/', async (req, res) => {
	const { query, offset, type } = req.query

	try {
		const { access_token } = getSession(req)
		const results = await search(query, access_token, type, offset)
		res.render('search', { ...results })
	} catch (e) {
		if (e instanceof UnauthorizedError) {
			console.error('Authentication error:', e)
			console.log('Redirecting to login page...')
			res.redirect('/login')
		} else if (e instanceof ValidationError) {
			console.error('Validation error:', e)
			res.render('index', { error: e.message })
		} else {
			console.error('Internal error:', e)
			res.render('search', { error: e.message })
		}
	}
})

module.exports = router
