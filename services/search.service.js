const { getUserInfo } = require('./auth.service');
const { InternalServerError, ValidationError } = require('./exceptions');
const { spotifyApiHost } = require('../config');

module.exports = {
  search: async (query, access_token, type = 'track,artist,album', offset = 0, limit = 20) => {

    const userInfo = await getUserInfo(access_token);

    if (!query) {
      return { userInfo, query };
    }

    console.log(`Searching for tracks, artists or albums... query: ${query}, type: ${type}, offset: ${offset}, limit: ${limit}`);

    const options = { headers: { 'Authorization': 'Bearer ' + access_token } };
    const queryParams = `q=${query}&type=${type}&offset=${offset}&limit=${limit}`;
    const response = await fetch(`${spotifyApiHost}/v1/search?${queryParams}`, options);
    const { error, tracks, artists, albums } = await response.json();

    if (error) {
      throw new ValidationError(error.message);
    }

    console.log(tracks.items[0]);

    const tracksItems = tracks.items.flatMap(item => {
      return {
        id: item.id,
        name: item.name.length > 37 ? item.name.slice(0, 37) + '...' : item.name,
        preview_url: item.preview_url,
        artists: item.artists.map(artist => artist.name).slice(0, 2).join(' & '),
        album: item.album.name.length > 30 ? item.album.name.slice(0, 30) + '...' : item.album.name,
        image: item.album.images.find(image => image.width === 64)?.url
      }
    });

    const artistsItems = artists.items.map(artist => {
      return {
        id: artist.id,
        name: artist.name,
        followers: artist.followers.total
      }
    });

    const albumsItems = albums.items.map(album => {
      return {
        id: album.id,
        name: album.name,
        image: album.images.find(image => image.width === 64)?.url,
        artists: album.artists.map(artist => artist.name).join(' & '),
        year: album.release_date.split('-')[0]
      }
    });

    return {
      query,
      userInfo,
      tracks: {
        items: tracksItems,
        offset: tracks.offset,
        limit: 20,
        total: tracks.total,
        previous: tracks.previous,
        next: tracks.next
      },
      artists: {
        items: artistsItems,
        offset: artists.offset,
        limit: 20,
        total: artists.total,
        previous: artists.previous,
        next: artists.next
      },
      albums: {
        items: albumsItems,
        offset: albums.offset,
        limit: 20,
        total: albums.total,
        previous: albums.previous,
        next: albums.next
      }
    };
  },

  getTrack: async (id, access_token) => {

    const userInfo = await getUserInfo(access_token);

    const options = { headers: { 'Authorization': 'Bearer ' + access_token } };
    const response = await fetch(`${spotifyApiHost}/v1/tracks/${id}`, options);
    const { error, album, artists, name, preview_url, external_urls } = await response.json();

    if (error) {
      throw new InternalServerError(error.message);
    }

    return {
      userInfo,
      id,
      name,
      preview_url,
      href: external_urls.spotify,
      artists: artists.map(artist => artist.name).join(' & '),
      album: album.name,
      image: album.images?.find(image => image.width >= 300 && image.width <= 600)?.url
    }
  },

  getArtist: async (id, access_token) => {

    const userInfo = await getUserInfo(access_token);

    const options = { headers: { 'Authorization': 'Bearer ' + access_token } };
    const response = await fetch(`${spotifyApiHost}/v1/artists/${id}`, options);
    const { error, name, external_urls, followers, genres, images } = await response.json();

    if (error) {
      throw new InternalServerError(error.message);
    }

    return {
      userInfo,
      id,
      name,
      href: external_urls.spotify,
      followers: followers.total,
      genres,
      image: images.find(image => image.width >= 300 && image.width <= 600)?.url
    };
  },

  getAlbum: async (id, access_token) => {

    const userInfo = await getUserInfo(access_token);

    const options = { headers: { 'Authorization': 'Bearer ' + access_token } };
    const response = await fetch(`${spotifyApiHost}/v1/albums/${id}`, options);
    const { error, name, external_urls, artists, images, release_date } = await response.json();

    if (error) {
      throw new InternalServerError(error.message);
    }

    return {
      userInfo,
      id,
      name,
      href: external_urls.spotify,
      image: images.find(image => image.width >= 300 && image.width <= 600)?.url,
      artists: artists.map(artist => artist.name).join(' & '),
      year: release_date.split('-')[0]
    };
  }
};
