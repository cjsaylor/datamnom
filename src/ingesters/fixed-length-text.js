var client = require('../client');
var Ingestor = require('../Ingestor');
var _ = require('lodash');
var writable = require('stream').Writable;
var util = require('util');

function FixedLengthIngestor () {
	Ingestor.apply(this, arguments);
}

FixedLengthIngestor.prototype = _.create(Ingestor.prototype, {
	constructor: FixedLengthIngestor
})

FixedLengthIngestor.prototype._write = function(chunk, encoding, next) {
	if (typeof encoding === 'function') {
		next = encoding;
	}
	this.buffer += chunk.toString();
	var records = this.buffer.split(this.fileOptions.lineDelimiter || '\r\n');
	var last = records.pop();
	if (last.length < this.fileOptions.fixLength) {
		this.buffer = last;
	} else {
		records.push(last);
	}
	var bulk = [];
	records
		.map(function(record) {
			var entry = {};
			for (key in this.fileOptions.fieldMap) {
				entry[key] = record
					.substring(this.fileOptions.fieldMap[key][0], this.fileOptions.fieldMap[key][1])
					.trim();
				if (key === 'amount') {
					// trim leading 0's
					entry[key] = entry[key].replace(/^0+/g,'');
				}
			}
			return entry;
		}, this)
		.forEach(function(entry) {
			bulk.push({create: { _index: this.esConfig.index, _type: this.esConfig.defaultType}});
			bulk.push(entry);
		}, this);
	client.bulk({body: bulk}, function(err, res, status) {
		if (err) {
			console.trace(err);
			return;
		}
		next();
	});
};

FixedLengthIngestor.prototype.setOptions = function (esConfig, fileOptions) {
	this.fileOptions = fileOptions;
	this.esConfig = esConfig;
};

module.exports = FixedLengthIngestor;
