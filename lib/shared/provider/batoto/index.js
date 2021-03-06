'use strict';
var regexp = /^http:\/\/bato\.to\/comic\/_\/comics\/(.*)-r([0-9]+)/i;
// e.g. http://tato.to/comic/comics/abc-r123

var Series = require('./series');

/**
 * Retrieves a series.
 * @param {string} address
 * @returns {ISeries}
 */
module.exports = function(address) {
  return regexp.test(address) ? new Series(address) : undefined;
};
