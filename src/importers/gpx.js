'use strict'

const client = require('../client')
const { getDistance } = require('geolib')
const FileImporter = require('../fileImporter')
const { parseString } = require('xml2js')
const { chunk } = require('lodash')

class GPXImporter extends FileImporter {
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
			// Calculate distance and speed between datapoints
			.reduce((acc, cur, i) => {
				if (!i) {
					cur.distance = 0.0
					cur.speed = 0.0
					acc.push(cur)
					return acc
				}
				cur.distance = getDistance(
					{
						latitude: acc[i - 1].location.lat,
						longitude: acc[i - 1].location.lon,
					},
					{
						latitude: cur.location.lat,
						longitude: cur.location.lon,
					},
					null,
					2
				)
				// Speed in m/s
				cur.speed = cur.distance / ((new Date(cur.timestamp) - new Date(acc[i-1].timestamp)) / 1000)
				return [...acc, cur]
			}, [])
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
					.map(bulk => client.bulk({body: bulk}))
			)
			next()
		} catch (e) {
			console.trace(e)
		}
	}
}

module.exports = GPXImporter