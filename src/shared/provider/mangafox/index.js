'use strict';
var Series = require('./series');

/**
 * Retrieves a series.
 * @param {string} location
 * @returns {Series}
 */
module.exports = function (location) {
    return (/^http:\/\/mangafox\.(com|me)\/manga\//i).test(location) ?
        new Series(location) :
        undefined;
};
