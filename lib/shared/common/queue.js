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
  // Gary
  this._current = 0; // Internal: it keeps track on current worker 
  this._done = done; // Pass in the call back.
  this._handler = handler; // Pass in how we want to handle data
  this._maximum = maximum < 1 ? 1 : maximum; // Pass in max workers
  this._queue = []; // Internal: it keeps track of queue.
}

/**
 * Kills the queue.
 * @param {Error} err
 */
Queue.prototype.kill = function(err) {
  this._queue = []; // queue is array, so put []
  if (this._done) this._done(err); // put up error as well.
};

/**
 * Push tasks on the queue.
 * @param {!(T|Array.<T>)} tasks
 */
Queue.prototype.push = function(tasks) {
  var that = this;

  // Push to array
  // Empty merge with other array
  [].concat(tasks).forEach(function(task) {
    that._queue.push(task);
  });

  // _current is the index of current core
  // _maximum is 8 e.g.
  // Basically, if the queue has something and we slowly increase the worker (cpu cores) number
  while (that._queue.length && this._current < this._maximum) _tryRun(that); 
};

/**
 * Attempt to run an item from the queue.
 * @private
 * @param {!Queue} that
 */
function _tryRun(that) {
  // that is the queue object i.e. the queue class
  // that._queue contains the actual manga series
  // each manga series has a handler. 

  //test
  //debugger;

  // If require too many workers or the queue is empty, return. Means things are done.
  if (that._current >= that._maximum || !that._queue.length) return;
  that._current += 1;

  /*
    - that._hanlder = handler below, which work on chapter or series.
    - When we create the Queue, we assign it with handler
    function(task, done) {
      if (task.chapter) return _taskChapter(emitter, task, done);
      _taskSeries(emitter, queue, task, done); 
    }

    there is "queue" in _taskSeries, because ....
  */

  that._handler(that._queue.shift(), function(err) {
    // If there is an error, _current minus one
    // error kill it, return
    // if _current is 0 and queue is 0, kill, return
    that._current -= 1; // Reduce the worker
    if (err) return that.kill(err); // Somehow is error, then kill 
    if (that._current === 0 && !that._queue.length) return that.kill(); // no worker and the queue is not empty, return.
    _tryRun(that); // Always try to run.
  });
}

module.exports = Queue;
