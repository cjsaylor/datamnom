'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var client = require('../src/client');
var ProgressBar = require('progress');
var ProgressStream = require('../src/Progress');
var FixedLengthIngestor = require('../src/ingesters/fixed-length-text');
var config = require(path.normalize(__dirname + '/../inbound/FY2013.json'));
var esConfig = config.destinations.elasticsearch;

var totalProgressGoal = _.keys(config.sources).length * 100

var progressBar = new ProgressBar('ingesting... [:bar] :percent', {
	complete: '=',
	incomplete: ' ',
	width: 30,
	total: totalProgressGoal
});

var progresses = {};

function calculateTotalProgress () {
	var total = 0;
	_.forIn(progresses, function (percentComplete) {
		total += percentComplete;
	});
	progressBar.update(total / totalProgressGoal);
}

_.forEach(config.sources, function(ingestOptions, filename) {
	var sourcePath = path.normalize(__dirname + '/../inbound/' + filename);
	var source = fs.createReadStream(sourcePath);
	var fileInfo = fs.statSync(sourcePath);
	var destination = new FixedLengthIngestor();

	destination.setOptions(esConfig, ingestOptions);

	destination.on('error', function (e) {
		console.error(e.stack);
	});

	var progressTracker = ProgressStream.createProgressStream(fileInfo.size);
	progressTracker.onprogress = _.throttle(function () {
		progresses[filename] = this.progress;
		calculateTotalProgress();
	}, 50);

	client.indices.get({index: esConfig.index})
		.catch(function() {
			return client.indices.create({index: esConfig.index});
		})
		.then(function() {
			return client.indices.getMapping({index: esConfig.index, type: esConfig.defaultType});
		})
		.then(function(mapping) {
			if (!Object.keys(mapping).length) {
				throw new Error('No mapping.');
			}
		})
		.catch(function() {
			return client.indices.putMapping({
				index: esConfig.index,
				type: esConfig.defaultType,
				body: esConfig.types
			});
		})
		.then(function() {
			return source.pipe(progressTracker).pipe(destination);
		})
		.catch(function (e) {
			console.error(e.stack);
		})
		.done();
});
