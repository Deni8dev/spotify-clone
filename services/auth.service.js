// curl --request GET \
//   --url 'https://api.spotify.com/v1/search?q=remaster%2520track%3ADoxy%2520artist%3AMiles%2520Davis&type=album' \
//   --header 'Authorization: Bearer 1POdFZRZbvb...qqillRxMr2z'

const getAccessToken = async () => {
  const { clientId, clientSecret } = config.spotify;
  const url = 'https://accounts.spotify.com/api/token';
  const options = {
    method: 'POST',
    url,
    form: {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    }
  };

  return new Promise((resolve, reject) => {

    fetch.config.headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

    fetch(url, options)

    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body).access_token);
      }
    });
  });
};

module.exports = {
  getAccessToken,
  getUserInfo: async (access_token) => {

    const options = { headers: { 'Authorization': 'Bearer ' + access_token } };
    const response = await fetch('https://api.spotify.com/v1/me', options);
    const { error, display_name, images } = await response.json();

    if (error && error.message === 'The access token expired')
      throw new Error(error.message);

    return {
      display_name,
      image: images.find(img => img.height === 64)?.url
    };
  }
};
