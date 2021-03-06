'use strict'

const FileImporter = require('../fileImporter')
const csvParse = require('neat-csv')
const client = require('../client')
const crypto = require('crypto');

class CSVImporter extends FileImporter {
	constructor(esConfig, fileOptions) {
		super()
		this.fileOptions = fileOptions
		this.esConfig = esConfig
		this.buffer = ''
		this.noopMap = record => record
	}

	async _write(chunk, encoding, next) {
		next = typeof encoding === 'function' ? encoding : next
		this.buffer += chunk.toString()
		if (this.buffer.split("\n").length < 1000) {
			next()
			return
		}
		try {
			this.shipLines(this.buffer)
			this.buffer = ''
			next()
		} catch (e) {
			console.trace(e)
		}
	}

	async _final() {
		if (this.buffer.length) {
			this.shipLines(this.buffer)
		}
	}

	async shipLines(buffer) {
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
		await client.bulk({
			body: operations
		})
	}
}

module.exports = CSVImporter
