const crypto = require('node:crypto')

module.exports = {
	generateRandomString: (length) => {
		return crypto.randomBytes(60).toString('hex').slice(0, length)
	}
}
