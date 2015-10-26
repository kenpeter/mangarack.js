'use strict';
var Page = require('./page');

// Gary
var is_global_debug = require('../../my_config');

/**
 * Represents a chapter.
 * @constructor
 * @implements {IChapter}
 * @param {string} address
 * @param {Array.<string>} identifier
 * @param {number} number
 * @param {?string} title
 * @param {number} volume
 */
function Chapter(address, identifier, number, title, volume) {
  this.address = address;
  this.identifier = identifier ? parseInt(identifier[1], 10) : undefined;
  this.number = number;
  this.title = title;
  this.version = NaN;
  this.volume = volume;
}

// Chapter is the data

/**
 * Retrieves each child.
 * @param {?} $
 * @returns {!Array.<!IPage>}
 */
Chapter.prototype.children = function($) {
  var address = /[0-9]+\.html$/i.test(this.address) ? // 2.html
    this.address :
    this.address + '1.html';
  var select = $('select.m').first();
  return select.find('option:not(:last-child)').map(function(i, el) {

    if(is_global_debug) {
      //test
      //debugger;
      //console.trace();
    }

    var next = $(el).text().trim() + '.html';
    var page = new Page(address.replace(/[0-9]+\.html$/i, next), i + 1);
    if (i === 0) {
      page.imageAddress = page.imageAddress($);
      page.address = undefined;
    }
    return page;
  }).get();
};

module.exports = Chapter;
