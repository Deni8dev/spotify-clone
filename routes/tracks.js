const express = require('express')
const { getTrack, updateTrack } = require('../services/search.service')
const router = express.Router()

router.get('/:id', async (req, res) => {
	const { id } = req.params
	const { action } = req.query
	const { session } = req.cookies
	const { access_token } = JSON.parse(atob(session))

	try {
		let trackDetails
		if (action) {
			trackDetails = await updateTrack(id, access_token, action)
		} else {
			trackDetails = await getTrack(id, access_token)
		}
		res.render('track-details', { ...trackDetails })
	} catch (e) {
		console.error('Cannot get track details:', e)
		res.render('index')
	}
})

module.exports = router
