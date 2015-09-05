'use strict';
var Agent = require('./agent'); // Represent a core?
var AdmZip = require('adm-zip'); // zip
var archiver = require('archiver'); // Similar to zip?
var defaultExtension = 'cbz'; // manga.cbz
var EventEmitter = require('events').EventEmitter; // e.g. fs.readStream emits an event when the file is opened
var fs = require('fs'); // file system
var path = require('path'); // directory path
var persistentFilename = '.mrpersistent';
var processor = require('./processor'); // Processor to do the task.
var request = require('./request'); // Represent a browser request
var shared = require('../shared'); // It contains manger provider, etc
var tempSuffix = '.mrswitching';
var utilities = require('./utilities'); // Check manger include, exist, etc

/**
 * Runs the tasks in a queue and returns an event emitter.
 * @param {!Array.<!{address: string, options: !IOptions}>} tasks
 * @param {number=} maximum
 * @returns {!EventEmitter}
 */
module.exports = function(tasks, maximum) {
  /*
    tasks contains which mangar series, download path, etc
    maximum == 8
  */
  var beginTimeInMs = Date.now(); // e.g. 1440834530914
  var emitter = new EventEmitter(); // Event stuff
  
  // Max num, handler, done for arguments.
  var queue = new shared.common.Queue(maximum, function(task, done) {

    if(task.options.debug) {
      //test
      debugger;
    }

    // e.g. task.chapter == 0
    // task == all arguments, command lines, etc 
    if (task.chapter) return _taskChapter(emitter, task, done);
    _taskSeries(emitter, queue, task, done);
  }, function(err) {
    
    if ('undefined' !== typeof task) {
      if(task.options.debug) {
        //test
        debugger;
      }
    }

    if (err) return emitter.emit('error', err);
    emitter.emit('end', {timeInMs: Date.now() - beginTimeInMs});
  });

  // Process next tick
  process.nextTick(function() {
    // The queue has many of {address: address, optiions: options};
    queue.push(tasks.map(function(task) {
      return {address: task.address, options: task.options};
    }));
  });

  // emitter === { domain: null, _events: {}, _maxListeners: undefined }
  return emitter;
};

/**
 * Creates an agent.
 * @private
 * @param {!Object} task
 * @param {function(Error, Agent=)} done
 */
function _createAgent(task, done) {
  processor(task.options, task.series, task.chapter, function(err, processors) {
    if (err) return done(err);
    var chapter = task.chapter;
    var chapterPath = task.chapterPath;
    var Meta = shared.publisher.Meta;
    var jacket = task.options.jacket;
    var series = task.series;
    done(undefined, task.options.meta ?
      new Agent(chapterPath, processors, jacket) :
      new Agent(chapterPath, processors, jacket, new Meta(series, chapter)));
  });
}

/**
 * Creates a clone of the archive.
 * @private
 * @param {!AdmZip} inputZip
 * @param {string} outputPath
 * @param {string} xml
 */
function _createArchiveClone(inputZip, outputPath, xml) {
  var outputZip = archiver.create('zip', {store: true});
  outputZip.pipe(fs.createWriteStream(outputPath));
  inputZip.getEntries().forEach(function(inputEntry) {
    if (inputEntry.name === 'ComicInfo.xml') return;
    outputZip.append(inputEntry.getData(), {name: inputEntry.name});
  });
  outputZip.append(xml, {name: 'ComicInfo.xml'});
  outputZip.finalize();
}

/**
 * Creates a shallow clone of the object.
 * @private
 * @param {!Object} object
 * @returns {!Object}
 */
function _createObjectClone(object) {
  var clone = {};
  Object.keys(object).forEach(function(key) {
    clone[key] = object[key];
  });
  return clone;
}

/**
 * Enqueues the chapter.
 * @private
 * @param {!EventEmitter} emitter
 * @param {!Queue} queue
 * @param {!Object} task
 * @param {!IChapter} chapter
 * @param {function(Error)} done
 */
function _enqueueChapter(emitter, queue, task, chapter, done) {
  /*
  if(task.options.debug) {
    //test
    debugger;
  } 
  */ 

  // Check and initialize chapter information.
  if (utilities.excluded(task.options, chapter)) return done(undefined);

  if(task.options.debug) {
    //test
    //debugger;
  }

  var extension = task.options.extension || defaultExtension;
  var chapterName = shared.common.alias(task.series, chapter, extension);
  if (!chapterName) return done(new Error('No chapter: ' + task.address));
  var chapterPath = path.join(task.seriesPath, chapterName);

  // Initialize the chapter task.
  var chapterTask = _createObjectClone(task);
  chapterTask.chapter = chapter;
  chapterTask.chapterName = chapterName;
  chapterTask.chapterPath = chapterPath;

  // Check the persistence entry or continue to enqueue the chapter task.
  var oldName = chapterTask.persistent[chapterTask.chapter.identifier];

  if(task.options.debug) {
    //test
    debugger;
  }

  if (oldName) return _enqueueChapterPersistent(emitter, chapterTask, done);
  utilities.exists(chapterTask.options, chapterPath, function(exists) {
    if (!exists) queue.push(chapterTask);
    done(undefined);
  });
}

/**
 * Updates embedded meta information with new information.
 * @private
 * @param {!Object} task
 * @param {string} chapterPath
 * @param {function(Error)} done
 */
function _enqueueChapterMeta(task, chapterPath, done) {
  var inputZip = new AdmZip(chapterPath);
  var zipEntry = inputZip.getEntry('ComicInfo.xml');
  if (!zipEntry) return done(undefined);
  shared.publisher.Meta.load(zipEntry.getData(), function(err, meta) {
    if (err) return done(err);
    meta.number = isNaN(task.chapter.number) ? undefined : task.chapter.number;
    meta.volume = isNaN(task.chapter.volume) ? undefined : task.chapter.volume;
    _createArchiveClone(inputZip, chapterPath + tempSuffix, meta.xml());
    fs.rename(chapterPath + tempSuffix, chapterPath, done);
  });
}

/**
 * Checks the persistence entry and renames the chapter when applicable.
 * @private
 * @param {!EventEmitter} emitter
 * @param {!Object} task
 * @param {function(Error)} done
 */
function _enqueueChapterPersistent(emitter, task, done) {
  var oldName = task.persistent[task.chapter.identifier];
  if (task.chapterName === oldName) return done(undefined);
  var oldPath = path.join(task.seriesPath, oldName);
  _enqueueChapterMeta(task, oldPath, function(err) {
    if (err) return done(err);
    task.persistent[task.chapter.identifier] = task.chapterName;
    emitter.emit('data', {item: task.chapterName, type: 'switched'});
    fs.rename(oldPath, task.chapterPath, function(err) {
      if (err) return done(err);
      _save(task.persistentPath, task.persistent, done);
    });
  });
}

/**
 * Enqueues the series.
 * @private
 * @param {!EventEmitter} emitter
 * @param {!Queue} queue
 * @param {!Object} task
 * @param {function(Error)} done
 */
function _enqueueSeries(emitter, queue, task, done) {
  request(task.series, 'utf8', function(err) {
    if(task.options.debug) {
      //test
      //debugger;
    }

    if (err) return done(err);
    task.seriesName = shared.common.clean(task.series.title);
    if (!task.seriesName) return done(new Error('No series: ' + task.address));
    task.seriesPath = path.join(task.options.output || '', task.seriesName);
    task.persistentPath = path.join(task.seriesPath, persistentFilename);
    task.persistent = {};
    fs.exists(task.persistentPath, function(exists) {
      if(task.options.debug) {
        //test
        debugger;
      }

      if (!exists) return _enqueueSeriesChapters(emitter, queue, task, done);
      fs.readFile(task.persistentPath, 'utf8', function(err, data) {
        //test
        debugger;

        try {
          if (err) return done(err);
          task.persistent = JSON.parse(data);
          _enqueueSeriesChapters(emitter, queue, task, done);
        } catch (err) {
          done(err);
        }
      });
    });
  });
}

/**
 * Enqueues each chapter in the series.
 * @private
 * @param {!EventEmitter} emitter
 * @param {!Queue} queue
 * @param {!Object} task
 * @param {function(Error)} done
 */
function _enqueueSeriesChapters(emitter, queue, task, done) {
  var cache = {};
  shared.common.async.eachSeries(task.series.children, function(chapter, next) {
    if(task.options.debug) {
      //test
      //debugger;
    }

    var volumeCache = cache[chapter.volume];
    if (!volumeCache) cache[chapter.volume] = volumeCache = {};
    if (volumeCache[chapter.number]) return next();
    volumeCache[chapter.number] = true;
    _enqueueChapter(emitter, queue, task, chapter, next);

    if(task.options.debug) {
      //test
      //debugger;
    }

  }, function(err) {
    if(task.options.debug) {
      //test
      //debugger;
    }

    if (err) return done(err);
    emitter.emit('data', {item: task.seriesName, type: 'surveyed'});
    done(undefined);
  });
}

/**
 * Saves a persistent record.
 * @private
 * @param {string} filePath
 * @param {!Object.<string, !Object>} record
 * @param {function(Error)} done
 */
function _save(filePath, record, done) {
  // Gary
  //test
  debugger;

  if (!Object.keys(record).length) return done(undefined);
  shared.common.lock(record, function(unlock) {
    var value = JSON.stringify(record, function(key, value) {
      return key.charAt(0) === '_' ? undefined : value;
    }, '  ');
    fs.writeFile(filePath + tempSuffix, value, 'utf8', function(err) {
      if (err) {
        unlock();
        return done(err);
      }
      fs.rename(filePath + tempSuffix, filePath, function(err) {
        unlock();
        done(err);
      });
    });
  });
}

/**
 * Runs a chapter task.
 * @private
 * @param {!EventEmitter} emitter
 * @param {!Object} task
 * @param {function(Error)} done
 */
function _taskChapter(emitter, task, done) {
  if(task.options.debug) {
    //test
    //debugger;
  }

  var begin = Date.now();
  emitter.emit('data', {item: task.chapterName, type: 'fetching'});
  request(task.chapter, 'utf8', function(err) {
    if (err) return done(err);
    _createAgent(task, function(err, agent) {
      if (err) return done(err);
      shared.publisher.mirror(agent, task.series, task.chapter, function(err) {
        if (err) return done(err);
        agent.publish(function(err) {
          if (err) return done(err);
          if (!agent._disposed && !task.options.persistent) {
            task.persistent[task.chapter.identifier] = task.chapterName;
          }
          emitter.emit('data', {
            item: task.chapterName,
            timeInMs: Date.now() - begin,
            type: agent._disposed ? 'disposed' : 'finished'
          });
          _save(task.persistentPath, task.persistent, done);
        });
      });
    });
  });
}

/**
 * Runs a series task.
 * @private
 * @param {!EventEmitter} emitter
 * @param {!Queue} queue
 * @param {!Object} task
 * @param {function(Error)} done
 */
function _taskSeries(emitter, queue, task, done) {
  /*
    emitter:
    { 
      domain: null,
      _events: { data: [Function], error: [Function], end: [Function] },
      _maxListeners: undefined 
    }

    it emits data, error, end

    queue:
    { 
      _current: 1,
      _done: [Function],
      _handler: [Function],
      _maximum: 8,
      _queue: [] 
    }

    queue contains: {address: task.address, options: task.options}
    task.address === the series' url, not chapter, this means the queue only
    contains multiple series.

    task:
    {
      lots of command options
    } 
  */

  // var shared = require('../shared'); on the very top
  task.series = shared.provider(task.address);

  //test
  debugger;

  if (task.series) return _enqueueSeries(emitter, queue, task, done);
  emitter.emit('data', {item: task.address, type: 'obscured'});
  done(undefined);
}
