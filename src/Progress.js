'use strict';

const { Transform } = require('stream')

var transform = require('stream').Transform;
var _ = require('lodash')

class ProgressStream extends Transform {

    constructor(totalBytes, onUpdate) {
        super()
        this.totalBytes = parseInt(totalBytes, 10)
        this.bytesDone = 0
        this.onUpdate = onUpdate
    }

    _transform(chunk, encoding, cb) {
        if (typeof encoding === 'function') {
            cb = encoding
        }
        this.bytesDone += chunk.length
        this.onUpdate(this.bytesDone / this.totalBytes)
        cb(null, chunk)
    }
}

module.exports = ProgressStream;
