var path = require('path');
var fs = require('fs');
var util = require('util');
var writable = require('stream').Writable;
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
	host: 'datamnom.dev:9200',
	apiVersion: '1.4'
});

var inbound = fs.createReadStream(path.normalize(__dirname + '/../inbound/FY2014.txt'));

var injestion = function() {
	writable.apply(this, arguments);
	this.buffer = '';
}

util.inherits(injestion, writable);

injestion.prototype._write = function(chunk, encoding, next) {
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

var fixLength = 358;

var typeMap = {
	vendorTransaction: {
		properties: {
			year: {type: 'integer'},
			account: {type: 'string'},
			name: {type: 'string', index: 'not_analyzed'},
			address1: {type: 'string'},
			address2: {type: 'string'},
			address3: {type: 'string'},
			city: {type: 'string', index: 'not_analyzed'},
			state: {type: 'string', index: 'not_analyzed'},
			zip: {type: 'string', index: 'not_analyzed'},
			payment_account: {type: 'integer'},
			pay_agency: {type: 'string', index: 'not_analyzed'},
			state_document_no: {type: 'string', index: 'not_analyzed'},
			payment_no: {type: 'string', index: 'not_analyzed'},
			date: {type: 'date'},
			agency_document_no: {type: 'string', index: 'not_analyzed'},
			contact_phone: {type: 'string', index: 'not_analyzed'},
			object_code: {type: 'string', index: 'not_analyzed'},
			object_description: {type: 'string', index: 'not_analyzed'},
			amount: {type: 'float'}
		}
	}
}

var outbound = new injestion();

outbound.on('error', console.error);

client.indices.get({index: 'flvendors'})
	.catch(function() {
		return client.indices.create({index: 'flvendors'});
	})
	.then(function() {
		return client.indices.getMapping({index: 'flvendors', type: 'vendorTransaction'});
	})
	.then(function(mapping) {
		if (!Object.keys(mapping).length) {
			throw new Error('No mapping.');
		}
	})
	.catch(function() {
		return client.indices.putMapping({
			index: 'flvendors',
			type: 'vendorTransaction',
			body: typeMap
		});
	})
	.then(function() {
		inbound.pipe(outbound);
	})
	.catch(console.error)
	.done();
