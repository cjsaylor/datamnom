'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
const co = require('co');
const P = require('bluebird');
const glob = P.promisify(require('glob'));
const junk = require('junk');
var client = require('../src/client');
var ProgressBar = require('progress');
var ProgressStream = require('../src/Progress');

co(function*() {
	const files = yield glob(__dirname + '/../inbound/*.json');
	files.filter(junk.not).forEach(configFile => {
		const config = require(configFile);
		const esConfig = config.destinations.elasticsearch;
		_.forEach(config.sources, (ingestOptions) => {
			const progressBar = new ProgressBar(`Injesting ${ingestOptions.name} ... [:bar] :percent ETA - :eta`, {
				width: 30,
				total: 100
			});
			const IngestorClass = require(`${__dirname}/../src/ingesters/${ingestOptions.ingestor}.js`);
			const injestor = new IngestorClass(esConfig, ingestOptions);
			injestor.on('error', e => console.error(e.stack));
			// @todo have the injestor return a read stream instead of assuming files
			// This would make it flexible to allow for other sources such as mysql or mongo
			const sourcePath = path.normalize(`${__dirname}/../inbound/${ingestOptions.inputFile}`);
			const source = fs.createReadStream(sourcePath);
			co(function*() {
				try {
					yield client.indices.get({index: esConfig.index});
				} catch (e) {
					yield client.indices.create({index: esConfig.index});
				}
				const mapping = yield client.indices.getMapping({
					index: esConfig.index,
					type: esConfig.defaultType
				});
				if (!Object.keys(mapping).length) {
					yield client.indices.putMapping({
						index: esConfig.index,
						type: esConfig.defaultType,
						body: esConfig.types
					});
				}
				// @todo possibly have the ingestor provide a progress stream.
				const fileInfo = fs.statSync(sourcePath);
				const progress = ProgressStream.createProgressStream(fileInfo.size);
				progress.onprogress = _.throttle(function() {
					progressBar.update(this.progress / 100);
				}, 250);
				source.pipe(progress).pipe(injestor);
			});
		});
	});
})
.catch(e => console.error(e));