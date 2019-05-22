'use strict';

const fs = require('fs');
const path = require('path');

const minimist = require('minimist')
const junk = require('junk');
const _ = require('lodash');
const client = require('../src/client');
const ProgressBar = require('progress');
const ProgressStream = require('../src/Progress');

const globCB = require('glob')
const glob = function(path) {
	return new Promise((res, rej) => {
		globCB(path, (err, matches) => {
			if (err) {
				rej(err)
				return
			}
			res(matches)
		})
	})
}

async function main() {
	const argv = minimist(process.argv.slice(2))
	const config = require(path.normalize(`${process.cwd()}/${argv.config}`))
	const ingestorClass = require(`${__dirname}/../src/ingesters/${config.ingestor.class}.js`)
	const files = await glob(argv.files)
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
	files.filter(junk.not).forEach(file => {
		const ingestor = new ingestorClass(config.destinations.elasticsearch, {
			title: path.basename(file, path.extname(file))
		})
		ingestor.on('error', e => console.error(e.stack))
		const fileInfo = fs.statSync(file);
		const source = fs.createReadStream(file)
		const progressBar = new ProgressBar(`Ingesting ${path.basename(file)} ... [:bar] :percent ETA - :eta`, {
			width: 30,
			total: 100,
		})
		const progress = new ProgressStream(fileInfo.size, _.throttle(progress => {
			progressBar.update(progress)
		}))
		source.pipe(progress).pipe(ingestor);
	})
}

main()