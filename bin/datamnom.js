'use strict';

const path = require('path');

const minimist = require('minimist')
const { throttle } = require('lodash');
const client = require('../src/client');
const ProgressBar = require('progress');
const ProgressStream = require('../src/Progress');

async function main() {
	const argv = minimist(process.argv.slice(2))
	const config = require(path.normalize(`${process.cwd()}/${argv.config}`))
	const importerClass = require(`${__dirname}/../src/importers/${config.importer.class}.js`)
	try {
		await client.indices.get({
			index: config.destinations.elasticsearch.index
		});
	} catch (e) {
		await client.indices.create({
			index: config.destinations.elasticsearch.index
		});
	}
	try {
		await client.indices.putMapping({
			index: config.destinations.elasticsearch.index,
			body: config.destinations.elasticsearch.types,
		})
	} catch (e) {
		console.trace(e)
	}
	// @todo when other input options are available, this will need to become dynamic
	const streams = await importerClass.getStreams(argv.files, config.destinations.elasticsearch, config.importer)
	streams.forEach(stream => {
		const progressBar = new ProgressBar(`Importing ${stream.title} ... [:bar] :percent ETA - :eta`, {
			width: 30,
			total: 100,
		})
		const progress = new ProgressStream(stream.size, throttle(progress => progressBar.update(progress)))
		try {
			stream.inputStream.pipe(progress).pipe(stream.outputStream)
		} catch (e) {
			console.trace(e)
		}

	})
}

main()