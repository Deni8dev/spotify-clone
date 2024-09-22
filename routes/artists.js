const express = require('express');
const { getArtist } = require('../services/search.service');
const router = express.Router();

router.get('/:id', async (req, res) => {

  const { id } = req.params;
  const { session } = req.cookies;
  const { access_token } = JSON.parse(atob(session));

  try {
    const artistDetails = await getArtist(id, access_token);
    res.render('artist-details', { ...artistDetails });
  } catch (e) {
    console.error('Cannot get artist details:', e);
    res.render('index');
  }

});

module.exports = router;
