/*jshint maxparams: 6*/
'use strict';
var Page = require('./page');

/**
 * Represents a chapter.
 * @constructor
 * @implements {IChapter}
 * @param {string} address
 * @param {Array.<string>} identifier
 * @param {number} number
 * @param {?string} title
 * @param {number} version
 * @param {number} volume
 */
function Chapter(address, identifier, number, title, version, volume) {
  this.address = address;
  this.identifier = identifier ? parseInt(identifier[1], 10) : undefined;
  this.number = number;
  this.title = title;
  this.version = version;
  this.volume = volume;
}

/**
 * Retrieves each child.
 * @param {?} $
 * @returns {!Array.<!IPage>}
 */
Chapter.prototype.children = function($) {
  var i = 0;
  var match;
  //  /lstImages\.push\("(.+?)"\)/gi
  // script:contains(lstImages)
  var regex = /lstImages\.push\("(.+?)"\)/gi;
  var results = [];
  var text = $('script:contains(lstImages)').text();
  while ((match = regex.exec(text))) {
    results.push(new Page(match[1], i + 1));
    i += 1;
  }
  return results;
};

module.exports = Chapter;
