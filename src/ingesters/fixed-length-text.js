var client = require('../client');
var writable = require('stream').Writable;
var util = require('util');
var fixLength = 358;
var fieldMap = {
	year: [0, 4],
	account: [7, 15],
	name: [17, 47],
	address1: [49, 79],
	address2: [81, 111],
	address3: [113, 143],
	city: [145, 161],
	state: [162, 164],
	zip: [165, 175],
	payment_account: [177, 183],
	pay_agency: [184, 224],
	state_document_no: [226, 236],
	payment_no: [238, 244],
	date: [246, 256],
	agency_document_no: [257, 263],
	contact_phone: [265, 276],
	object_code: [287, 292],
	object_description: [294, 341],
	amount: [344, 356]
};

var ingestion = function() {
	writable.apply(this, arguments);
	this.buffer = '';
}

util.inherits(ingestion, writable);

ingestion.prototype._write = function(chunk, encoding, next) {
	if (typeof encoding === 'function') {
		next = encoding;
	}
	this.buffer += chunk.toString();
	var records = this.buffer.split('\r\n');
	var last = records.pop();
	if (last.length < fixLength) {
		this.buffer = last;
	} else {
		records.push(last);
	}
	var bulk = [];
	records
		.map(function(record) {
			var entry = {};
			for (key in fieldMap) {
				entry[key] = record.substring(fieldMap[key][0], fieldMap[key][1]).trim();
			}
			return entry;
		})
		.forEach(function(entry) {
			bulk.push({create: { _index: 'flvendors', _type: 'vendorTransaction'}});
			bulk.push(entry);
		});
	client.bulk({body: bulk}, function(err, res, status) {
		if (err) {
			console.trace(err);
			return;
		}
		next();
	});
};

module.exports = ingestion;