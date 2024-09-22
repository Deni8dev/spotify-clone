const { getUserInfo } = require('./auth.service');

module.exports = {
  search: async (query, access_token) => {

    const userInfo = await getUserInfo(access_token);

    const options = { headers: { 'Authorization': 'Bearer ' + access_token } };
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track,artist,album`, options);
    const { error, tracks, artists, albums } = await response.json();

    if (error) {
      throw new Error(error.message);
    }

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

    const getPageDescription = (offset, total) => {
      return `Showing ${offset + 1} - ${offset + 20} of ${total}`;
    };

    return {
      query,
      userInfo,
      tracks: { items: tracksItems, pageDescription: getPageDescription(tracks.offset, tracks.total) },
      artists: { items: artistsItems, pageDescription: getPageDescription(artists.offset, artists.total) },
      albums: { items: albumsItems, pageDescription: getPageDescription(albums.offset, albums.total) }
    };
  },
  getTrack: async (id, access_token) => {

    const userInfo = await getUserInfo(access_token);

    const options = { headers: { 'Authorization': 'Bearer ' + access_token } };
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, options);
    const { error, album, artists, name, preview_url } = await response.json();

    if (error) {
      throw new Error(error.message);
    }

    return {
      userInfo,
      id,
      name,
      preview_url,
      artists: artists.map(artist => artist.name).join(' & '),
      album: album.name,
      image: album.images?.find(image => image.width >= 300 && image.width <= 600)?.url
    }
  },
  getArtist: async (id, access_token) => {

    const userInfo = await getUserInfo(access_token);

    const options = { headers: { 'Authorization': 'Bearer ' + access_token } };
    const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, options);
    const { error, name, external_urls, followers, genres, images } = await response.json();

    if (error) {
      throw new Error(error.message);
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
    const response = await fetch(`https://api.spotify.com/v1/albums/${id}`, options);
    const { error, name, external_urls, artists, images, release_date } = await response.json();

    if (error) {
      throw new Error(error.message);
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
