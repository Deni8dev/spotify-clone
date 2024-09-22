const express = require('express');
const { getAlbum } = require('../services/search.service');
const router = express.Router();

router.get('/:id', async (req, res) => {

  const { id } = req.params;
  const { session } = req.cookies;
  const { access_token } = JSON.parse(atob(session));

  try {
    const albumDetails = await getAlbum(id, access_token);
    res.render('album-details', { ...albumDetails });
  } catch (e) {
    console.error('Cannot get album details:', e);
    res.render('index');
  }

});

module.exports = router;
