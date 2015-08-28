'use strict'; /* Remove more errors */

// require is interesting, require.common is the directory
// affix is the file
var affix = require('../shared').common.affix;

var defaultSource = 'MangaRack.txt'; // list of series
var fs = require('fs'); // file stream
var nodejs = require('../nodejs'); // Will come back later
var os = require('os'); // Access many os level things e.g. os.networkInterfaces
var parse = require('./parse'); // Parse options

/*
 * The main application.
 */
(function() {
  var options = parse(process.argv);
  _initialize(options, options.source || defaultSource, function(err, tasks) {

    if(options.debug) {
      //test
      //debugger;
    }

    if (err) return console.error(err.stack || err);
    var maximum = options.workers || os.cpus().length;
    nodejs(tasks, maximum).on('data', function(data) {
      console.log(_pretty(data));
    }).on('error', function(err) {
      console.error(err.stack || err);
      if (!options.keepAlive) process.exit(1);
    }).on('end', function(data) {
      console.log('Completed ' + _calculate(data.timeInMs) + '!');
    });
  });
})();

/**
 * Calculate the hours, minutes and seconds.
 * @private
 * @param {number} timeInMs
 * @returns {string}
 */
function _calculate(timeInMs) {
  var seconds = affix(Math.floor(timeInMs / 1000) % 60, 2);
  var minutes = affix(Math.floor(timeInMs / 1000 / 60) % 60, 2);
  var hours = affix(Math.floor(timeInMs / 1000 / 60 / 60), 2);
  return '(' + hours + ':' + minutes + ':' + seconds + ')';
}

/**
 * Initializes the tasks.
 * @private
 * @param {!IOptions} options
 * @param {string} batchPath
 * @param {function(Error, Array.<!{address: string, options: !IOptions}>)} done
 */
function _initialize(options, batchPath, done) {
  // options many option
  // batchPath: MangaRack.txt
  // done: 

  if (options.args.length) {
    /*
      - options.args can be array of manga urls.
      - options.args.map, maps each element with some operations, then return;
    */

    if(options.debug) {
      //test
      debugger;
    }

    return done(undefined, options.args.map(function(address) {
      if(options.debug) {
        //test
        debugger;
      }

      // address === http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/
      // options contain large mount of options
      return {address: address, options: options};
    }));
  }

  fs.exists(batchPath, function(exists) {
    if (!exists) return done(undefined, []);
    // we don't have batch file, so ignore for now. MangaRack.txt
    fs.readFile(batchPath, 'utf8', function(err, data) {
      if (err) return done(err);
      var map = [];
      data.split(/\r?\n/).forEach(function(line) {
        if (/^(\/\/|#)/.test(line)) return;
        var lineOptions = parse(process.argv.concat(_split(line)));
        lineOptions.args.forEach(function(address) {
          if (!address) return;
          map.push({address: address, options: lineOptions});
        });
      });
      done(undefined, map);
    });
  });
}

/**
 * Splits the value into arguments.
 * @private
 * @param {string} value
 * @returns {Array.<string>}
 */
function _split(value) {
  var inQuote = false;
  var pieces = [];
  var previous = 0;
  for (var i = 0; i < value.length; i += 1) {
    if (value.charAt(i) === '"') {
      inQuote = !inQuote;
    }
    if (!inQuote && value.charAt(i) === ' ') {
      pieces.push(value.substring(previous, i).match(/^"?(.+?)"?$/)[1]);
      previous = i + 1;
    }
  }
  var lastPiece = value.substring(previous, i).match(/^"?(.+?)"?$/);
  if (lastPiece) pieces.push(lastPiece[1]);
  return pieces;
}

/**
 * Prettify the emitted data.
 * @private
 * @param {!{item: string, timeInMs: ?number, type: string}} data
 * @returns {string}
 */
function _pretty(data) {
  var type = data.type.charAt(0).toUpperCase() + data.type.substr(1);
  var time = data.timeInMs ? ' ' + _calculate(data.timeInMs) : '';
  return type + ' ' + data.item + time;
}
