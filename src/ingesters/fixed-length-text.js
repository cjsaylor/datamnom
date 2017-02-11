'use strict';

const client = require('../client');
const Ingestor = require('../Ingestor');
const _ = require('lodash');
const {Writable} = require('stream');

class FixedLengthIngestor extends Writable {
	constructor(esConfig, fileOptions) {
		super();
		this.buffer = '';
		this.fileOptions = fileOptions;
		this.esConfig = esConfig;
		this.id = 1;
	}

	_write(chunk, encoding, next) {
		if (typeof encoding === 'function') {
			next = encoding;
		}
		this.buffer += chunk.toString();
		const records = this.buffer.split(this.fileOptions.lineDelimiter || '\r\n');
		const last = records.pop();
		if (last.length < this.fileOptions.fixLength) {
			this.buffer = last;
		} else {
			records.push(last);
		}
		let bulk = [];
		records
			.map(record => {
				let entry = {};
				_.forEach(this.fileOptions.fieldMap, (range, key) => {
					const [from, to] = range;
					entry[key] = record.substring(from, to).trim().replace(/^0+/g, '');
				});
				return entry;
			})
			.forEach(entry => {
				// @todo configure an "ID" field
				bulk.push({create: { _index: this.esConfig.index, _type: this.esConfig.defaultType, _id: this.id++}});
				bulk.push(entry);
			});
		client.bulk({body: bulk}, function(err, res, status) {
			if (err) {
				console.trace(err);
				return;
			}
			next();
		});
	}
};

module.exports = FixedLengthIngestor;
