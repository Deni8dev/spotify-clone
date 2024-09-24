const express = require('express')
const { UnauthorizedError, ValidationError } = require('../services/exceptions')
const { getUserInfo } = require('../services/auth.service')
const router = express.Router()

const getSession = (req) => {
	const { session } = req.cookies
	try {
		return JSON.parse(atob(session))
	} catch (e) {
		throw new UnauthorizedError('Invalid session')
	}
}

/* GET home page. */
router.get('/', async (req, res) => {
	const { query } = req.query

	try {
		if (!query) {
			const { access_token } = getSession(req)
			const userInfo = await getUserInfo(access_token)
			res.render('index', { userInfo })
		} else {
			res.redirect(`/search?query=${query}`)
		}
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
