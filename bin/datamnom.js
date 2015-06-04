var path = require('path');
var fs = require('fs');
var util = require('util');
var writable = require('stream').Writable;

var inbound = fs.createReadStream(path.normalize(__dirname + '/../inbound/test.tsv'));

var injestion = function() {
	writable.call(this, arguments);
	this.buffer = '';
}

util.inherits(injestion, writable);

injestion.prototype._write = function(chunk, encoding, next) {
	if (typeof encoding === 'function') {
		next = encoding;
	}
	console.log(chunk.toString());
	next();
}

var outbound = new injestion();

inbound.pipe(outbound);
