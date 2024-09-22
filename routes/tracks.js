const express = require('express');
const { getTrack } = require('../services/search.service');
const router = express.Router();

router.get('/:id', async (req, res, next) => {

  const { id } = req.params;
  const { session } = req.cookies;
  const { access_token } = JSON.parse(atob(session));

  try {
    const trackDetails = await getTrack(id, access_token);
    res.render('track-details', { ...trackDetails });
  } catch (e) {
    console.error('Cannot get track details:', e);
    res.render('index');
  }
});

module.exports = router;
