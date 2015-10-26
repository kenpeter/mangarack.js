// What is a series, basically, you pass the managa url
'use strict';
var Series = require('./series');

/**
 * Retrieves a series.
 * @param {string} address
 * @returns {ISeries}
 */
module.exports = function(address) {
  //test
  //debugger;

  /*
    Flow:

    * Queue.prototype.push task in queues in queue.js
    * that._handler(that._queue.shift(), function(err) in queue.js, run one by one
    * _taskSeries(emitter, queue, task, done); in nodejs index.js
    * task.series = shared.provider(task.address); in nodejs index.js
    * shared/provider/index.js
    * providers.every(function(provider) in provider index.js, loop through each
    * now it meets mangafox, here
  */

  return /^http:\/\/mangafox\.(com|me)\/manga\//i.test(address) ?
    new Series(address) :
    undefined;
};

// http://mangafox.com/manga
