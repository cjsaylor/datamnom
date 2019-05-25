'use strict'

const { Writable } = require('stream')

const csvParse = require('neat-csv')
const client = require('../client')
const crypto = require('crypto');

class CSVIngestor extends Writable {
	constructor(esConfig, fileOptions) {
		super()
		this.fileOptions = fileOptions
		this.esConfig = esConfig
		this.noopMap = record => record
	}

	async _write(chunk, encoding, next) {
		next = typeof encoding === 'function' ? encoding : next
		const buffer = chunk.toString()
		const records = await csvParse(buffer, {
			headers: this.fileOptions.headers,
			separator: this.fileOptions.delimiter,
		})
		const operations = records
			.map(this.fileOptions.mapper || this.noopMap)
			.reduce((prev, cur) => ([
				...prev,
				{
					index: {
						_index: this.esConfig.index,
						_id: crypto.createHash('md5').update(JSON.stringify(cur)).digest("hex"),
					}
				},
				cur,
			]), [])
		try {
			await client.bulk({body: operations})
			next()
		} catch (e) {
			console.trace(e)
		}
	}
}

module.exports = CSVIngestor
