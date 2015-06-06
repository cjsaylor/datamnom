'use strict';

var _ = require('lodash')
var writable = require('stream').Writable;

function Ingestor () {
  writable.apply(this, arguments);
  this.buffer = '';
}
  
/**
 * Skeleton progress indiciation, @todo: implement
 * 
 * @param {Number} percent Percent completed
 * @return {void}
 */
Ingestor.prototype.progress = function update_progress (percent) {

}

Ingestor.prototype = _.create(writable.prototype, {
  constructor: Ingestor
});

module.exports = Ingestor
