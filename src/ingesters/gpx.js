'use strict'

const client = require('../client')
const { Writable } = require('stream')
const { parseString } = require('xml2js')
const { chunk } = require('lodash')

class GPXIngestor extends Writable {
	constructor(esConfig, fileOptions) {
		super()
		this.buffer = ''
		this.fileOptions = fileOptions
		this.esConfig = esConfig
	}

	async _write(chunk, encoding, next) {
		if (typeof encoding === 'function') {
			next = encoding
		}
		// We can buffer the whole thing because in this use case, the files won't be that large.
		// It also makes parsing the gpx file much easier
		this.buffer += chunk.toString()
		next()
	}

	async _final(next) {
		const parsed = await new Promise((res, rej) => {
			parseString(this.buffer, (err, data) => {
				if (err) {
					rej(err)
				} else {
					res(data)
				}
			})
		})
		const operations = parsed.gpx.trk[0].trkseg[0].trkpt
			.map(point => {
				const entry = {
					location: {
						lat: point.$.lat,
						lon: point.$.lon,
					},
					title: this.fileOptions.title,
					elevation: parseInt(point.ele[0], 10),
					timestamp: point.time[0],
				}
				if (
					point.extensions &&
					point.extensions[0]['gpxtpx:TrackPointExtension'] &&
					point.extensions[0]['gpxtpx:TrackPointExtension'][0]['gpxtpx:hr'][0]
				) {
					entry.hr = parseInt(point.extensions[0]['gpxtpx:TrackPointExtension'][0]['gpxtpx:hr'][0], 10)
				}
				return entry
			})
			.reduce((prev, cur) => ([
				...prev,
				{
					index: {
						_index: this.esConfig.index,
						_id: this.fileOptions.title + cur.timestamp
					}
				},
				cur
			]), [])
		try {
			await Promise.all(
				chunk(operations, 1000)
					.map(bulk => client.bulk({body: operations}))
			)
			next()
		} catch (e) {
			console.trace(e)
		}
	}
}

module.exports = GPXIngestor