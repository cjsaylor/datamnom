'use strict'

const { Writable } = require('stream')
const path = require('path');
const fs = require('fs');

const junk = require('junk');

const globCB = require('glob')
const glob = function (path) {
	return new Promise((res, rej) => {
		globCB(path, (err, matches) => {
			if (err) {
				rej(err)
				return
			}
			res(matches)
		})
	})
}

class FileImporter extends Writable {

	static async getStreams(globTemplate, esConfig, fileOptions) {
		const files = await glob(globTemplate)
		return files.filter(junk.not).map(file => {
			const { size } = fs.statSync(file)
			const inputStream = fs.createReadStream(file)
			const title = path.basename(file, path.extname(file))
			const outputStream = new this(esConfig, {
				...fileOptions,
				title,
			})
			return {inputStream, outputStream, size, title}
		})
	}
}

module.exports = FileImporter