var path = require('path');
var fs = require('fs');
var client = require('../src/client');
var FixedLengthIngestor = require('../src/ingesters/fixed-length-text');
var config = require(path.normalize(__dirname + '/../inbound/FY2013.json'));
var destination = new FixedLengthIngestor();
var _ = require('lodash');
var esConfig = config.destinations.elasticsearch;

destination.on('error', console.error);


_.forEach(config.sources, function(ingestOptions, filename) {
	var source = fs.createReadStream(path.normalize(__dirname + '/../inbound/' + filename));

	client.indices.get({index: esConfig.index})
		.catch(function() {
			return client.indices.create({index: esConfig.index});
		})
		.then(function() {
			// @todo type is still hardcoded
			return client.indices.getMapping({index: esConfig.index, type: 'vendorTransaction'});
		})
		.then(function(mapping) {
			if (!Object.keys(mapping).length) {
				throw new Error('No mapping.');
			}
		})
		.catch(function() {
			return client.indices.putMapping({
				index: esConfig.index,
				// @todo type is still hardcoded
				type: 'vendorTransaction',
				body: esConfig.types
			});
		})
		.then(function() {
			source.pipe(destination);
		})
		.catch(console.error)
		.done();
});
