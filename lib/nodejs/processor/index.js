'use strict';
var animation = require('./animation');
var available;
var footer = require('./footer');
var exec = require('child_process').exec;
var generalize = require('./generalize');
var transform = require('./transform');
var processors = [animation, footer, generalize, transform];

/**
 * Creates an array of processors for the task.
 * @param {!IOptions} options
 * @param {!ISeries} series
 * @param {!IChapter} chapter
 * @param {function(Error, Array.<!IProcessor>=)} done
 */
module.exports = function(options, series, chapter, done) {
  _check(function(err, available) {
    if (err) return done(err);
    if (!available) return done(err, []);
    done(undefined, processors.map(function(processor) {
      return processor.create(options, series, chapter);
    }).filter(Boolean));
  });
};

/**
 * Adds a processor.
 * @param {!IProcessor} processor
 */
module.exports.push = function(processor) {
  processors.push(processor);
};

/**
 * Determines whether the module is available.
 * @private
 * @param {function(Error, ?boolean)} done
 */
function _check(done) {
  if (typeof available !== 'undefined') return done(undefined, available);
  exec('gm', function(err, stdout) {
    available = Boolean(stdout);
    done(undefined, available);
  });
}
