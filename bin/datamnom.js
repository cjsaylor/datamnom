var path = require('path');
var fs = require('fs');
var client = require('../src/client');
var FixedLengthIngestor = require('../src/ingesters/fixed-length-text');

var inbound = fs.createReadStream(path.normalize(__dirname + '/../inbound/FY2013.txt'));

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

var outbound = new FixedLengthIngestor();

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
