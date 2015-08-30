'use strict';

/*
  The class pattern is in a single file
  function Queue() {

  }

  Queue.prototype.kill = function() {
  
  }

  Queue.prototype.start = function() {
  
  }

  ....


  module.exports = Queue; 

*/

/**
 * Represents a queue.
 * @constructor
 * @param {number} maximum
 * @param {function(T, function(Error))} handler
 * @param {function(Error)=} done
 * @template T
 */
function Queue(maximum, handler, done) {
  this._current = 0;
  this._done = done;
  this._handler = handler;
  this._maximum = maximum < 1 ? 1 : maximum;
  this._queue = [];
}

/**
 * Kills the queue.
 * @param {Error} err
 */
Queue.prototype.kill = function(err) {
  this._queue = [];
  if (this._done) this._done(err);
};

/**
 * Push tasks on the queue.
 * @param {!(T|Array.<T>)} tasks
 */
Queue.prototype.push = function(tasks) {
  var that = this;

  // Push to array
  [].concat(tasks).forEach(function(task) {
    that._queue.push(task);
  });

  // _current is the index of current core
  // _maximum is 8 e.g. 
  while (that._queue.length && this._current < this._maximum) _tryRun(that); //  
};

/**
 * Attempt to run an item from the queue.
 * @private
 * @param {!Queue} that
 */
function _tryRun(that) {
  // that is the queue object i.e. this class

  //test
  debugger;

  if (that._current >= that._maximum || !that._queue.length) return;
  that._current += 1;

  /*
    The handler:
    function(task, done) {
      if (task.chapter) return _taskChapter(emitter, task, done);
      _taskSeries(emitter, queue, task, done);
    }
  */

  that._handler(that._queue.shift(), function(err) {
    // If there is an error, _current minus one
    // error kill it, return
    // if _current is 0 and queue is 0, kill, return
    that._current -= 1;
    if (err) return that.kill(err);
    if (that._current === 0 && !that._queue.length) return that.kill();
    _tryRun(that);
  });
}

module.exports = Queue;
