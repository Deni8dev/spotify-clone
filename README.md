## Spotify API Demo

This is a demo of the Spotify API. It is a simple web app that uses the Spotify Web API to search for tracks, artists, and albums. It also uses the Spotify Login API to authenticate users.

## Setup

1. Clone the repository
2. Create a Spotify Developer account at [developer.spotify.com](https://developer.spotify.com/dashboard/login)
3. Create a new app and copy the client ID and client secret
4. Rename `.env.example` to `.env` and fill in the client ID and client secret
5. Run `npm install` to install the dependencies
6. Run `npm start` to start the server
7. Open `http://localhost:3000` in your browser

## Endpoints

### GET /

Initializes the app by redirecting the user to the Spotify login page.

### GET /login

Redirects the user to the Spotify login page. After the user logs in, the app redirects them back to the home page.

### GET /search

Searches for tracks, artists, and albums using the Spotify search API. The user can search for tracks, artists, or albums by entering a search query.

### GET /tracks

Returns the details of a track based on the search query.

### GET /artists

Returns the details of an artist based on the search query.

### GET /albums

Returns the details of an album based on the search query.
