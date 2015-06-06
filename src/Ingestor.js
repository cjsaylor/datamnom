'use strict';

var _ = require('lodash')
var writable = require('stream').Writable;

function Ingestor () {
  writable.apply(this, arguments);
  this.buffer = '';
}

Ingestor.prototype = _.create(writable.prototype, {
  constructor: Ingestor
});

module.exports = Ingestor
