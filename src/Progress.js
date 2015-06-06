'use strict';

var transform = require('stream').Transform;
var _ = require('lodash')

function ProgressStream (totalBytes) {
  transform.apply(this, arguments);
  this.progress = 0;
  this.bytesDone = 0;
  this.totalBytes = totalBytes;
}

ProgressStream.prototype = _.create(transform.prototype, {
  constructor: ProgressStream
})

ProgressStream.prototype.onprogress = function noop () {};

ProgressStream.prototype._transform = function track_progress (chunk, encoding, cb) {
  this.bytesDone += chunk.length;
  this.progress = Math.round(this.bytesDone / parseInt(this.totalBytes, 10) * 100);
  this.onprogress.call(this)
  cb(null, chunk);
}

ProgressStream.createProgressStream = function progress_stream_factory (totalBytes) {
  return new ProgressStream(totalBytes);
}

module.exports = ProgressStream;
