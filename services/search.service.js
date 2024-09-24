const { getUserInfo } = require('./auth.service')
const { InternalServerError, ValidationError } = require('./exceptions')
const { spotifyApiHost } = require('../config')

const getResult = ({ items, offset, limit, total, previous, next }) => {
	return {
		items,
		offset,
		limit,
		total,
		previous,
		next
	}
}

module.exports = {
	search: async (
		query,
		access_token,
		type = 'track',
		offset = 0,
		limit = 20
	) => {
		const userInfo = await getUserInfo(access_token)

		if (!query) {
			return { userInfo, query }
		}

		console.log(
			`Searching for tracks, artists or albums... query: ${query}, type: ${type}, offset: ${offset}, limit: ${limit}`
		)

		const options = { headers: { Authorization: `Bearer ${access_token}` } }
		const queryParams = `q=${query}&type=${type}&offset=${offset}&limit=${limit}`
		const response = await fetch(
			`${spotifyApiHost}/v1/search?${queryParams}`,
			options
		)
		const { error, tracks, artists, albums } = await response.json()

		if (error) {
			throw new ValidationError(error.message)
		}

		const checkInLibrary = async (ids) => {
			const response = await fetch(
				`${spotifyApiHost}/v1/me/tracks/contains?ids=${ids}`,
				options
			)
			return await response.json()
		}

		const getTracks = async () => {
			const tracksWithResultData = {
				...getResult(tracks),
				items: tracks.items.map((item) => ({
					id: item.id,
					name:
						item.name.length > 45 ? `${item.name.slice(0, 45)}...` : item.name,
					preview_url: item.preview_url,
					artists: item.artists
						.map((artist) => artist.name)
						.slice(0, 2)
						.join(' & '),
					album:
						item.album.name.length > 45
							? `${item.album.name.slice(0, 45)}...`
							: item.album.name,
					image: item.album.images.find((image) => image.width === 64)?.url
				}))
			}

			const inLibrary = await checkInLibrary(
				tracksWithResultData.items.map((item) => item.id)
			)

			for (let index = 0; index < tracksWithResultData.items.length; index++) {
				tracksWithResultData.items[index].inLibrary = inLibrary[index]
			}

			return tracksWithResultData
		}

		const getArtists = () => {
			return {
				...getResult(artists),
				items: artists.items.map((artist) => ({
					id: artist.id,
					name: artist.name,
					followers: artist.followers.total,
					image: artist.images.find((image) => image.width === 64)?.url
				}))
			}
		}

		const getAlbums = () => {
			return {
				...getResult(albums),
				items: albums.items.map((album) => ({
					id: album.id,
					name: album.name,
					image: album.images.find((image) => image.width === 64)?.url,
					artists: album.artists.map((artist) => artist.name).join(' & '),
					year: album.release_date.split('-')[0]
				}))
			}
		}

		return {
			query,
			type,
			userInfo,
			tracks: tracks && (await getTracks()),
			artists: artists && getArtists(),
			albums: albums && getAlbums()
		}
	},

	getTrack: async (id, access_token) => {
		const userInfo = await getUserInfo(access_token)

		const options = { headers: { Authorization: `Bearer ${access_token}` } }
		const response = await fetch(`${spotifyApiHost}/v1/tracks/${id}`, options)
		const { error, album, artists, name, preview_url, external_urls } =
			await response.json()

		if (error) {
			throw new InternalServerError(error.message)
		}

		const inLibrary = await fetch(
			`${spotifyApiHost}/v1/me/tracks/contains?ids=${id}`,
			options
		)
			.then((res) => res.json())
			.then((body) => body[0] === true)

		return {
			userInfo,
			id,
			name,
			preview_url,
			inLibrary,
			href: external_urls.spotify,
			artists: artists.map((artist) => artist.name).join(' & '),
			album: album.name,
			image: album.images?.find(
				(image) => image.width >= 300 && image.width <= 600
			)?.url
		}
	},

	updateTrack: async (id, access_token, action) => {
		const userInfo = await getUserInfo(access_token)
		const options = { headers: { Authorization: `Bearer ${access_token}` } }

		if (action === 'add') {
			await fetch(`${spotifyApiHost}/v1/me/tracks?ids=${id}`, {
				method: 'PUT',
				...options
			})
		} else if (action === 'remove') {
			await fetch(`${spotifyApiHost}/v1/me/tracks?ids=${id}`, {
				method: 'DELETE',
				...options
			})
		}

		const response = await fetch(`${spotifyApiHost}/v1/tracks/${id}`, options)
		const { error, album, artists, name, preview_url, external_urls } =
			await response.json()

		if (error) {
			throw new InternalServerError(error.message)
		}

		return {
			userInfo,
			id,
			name,
			preview_url,
			inLibrary: action === 'add',
			href: external_urls.spotify,
			artists: artists.map((artist) => artist.name).join(' & '),
			album: album.name,
			image: album.images?.find(
				(image) => image.width >= 300 && image.width <= 600
			)?.url
		}
	},

	getArtist: async (id, access_token) => {
		const userInfo = await getUserInfo(access_token)

		const options = { headers: { Authorization: `Bearer ${access_token}` } }
		const response = await fetch(`${spotifyApiHost}/v1/artists/${id}`, options)
		const { error, name, external_urls, followers, genres, images } =
			await response.json()

		if (error) {
			throw new InternalServerError(error.message)
		}

		return {
			userInfo,
			id,
			name,
			href: external_urls.spotify,
			followers: followers.total,
			genres,
			image: images.find((image) => image.width >= 300 && image.width <= 600)
				?.url
		}
	},

	getAlbum: async (id, access_token) => {
		const userInfo = await getUserInfo(access_token)

		const options = { headers: { Authorization: `Bearer ${access_token}` } }
		const response = await fetch(`${spotifyApiHost}/v1/albums/${id}`, options)
		const { error, name, external_urls, artists, images, release_date } =
			await response.json()

		if (error) {
			throw new InternalServerError(error.message)
		}

		return {
			userInfo,
			id,
			name,
			href: external_urls.spotify,
			image: images.find((image) => image.width >= 300 && image.width <= 600)
				?.url,
			artists: artists.map((artist) => artist.name).join(' & '),
			year: release_date.split('-')[0]
		}
	}
}
