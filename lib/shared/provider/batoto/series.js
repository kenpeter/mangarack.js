'use strict';
var Chapter = require('./chapter');
var scanner = require('../scanner');

/**
 * Represents a series.
 * @constructor
 * @implements {ISeries}
 * @param {string} address
 */
function Series(address) {
  this.address = address;
}

// url for series

/**
 * Retrieves each artist.
 * @param {?} $
 * @returns {!Array.<string>}
 */
Series.prototype.artists = function($) {
  return $('td:contains(Artist:)+ > a').map(function(i, el) {
    return $(el).text().trim() || undefined;
  }).get();
};

// artists

/**
 * Retrieves each author.
 * @param {?} $
 * @returns {!Array.<string>}
 */
Series.prototype.authors = function($) {
  // td:contains author/artist/genres/description
  return $('td:contains(Author:)+ > a').map(function(i, el) {
    return $(el).text().trim() || undefined;
  }).get();
};

// authors

/**
 * Retrieves each child.
 * @param {?} $
 * @returns {!Array.<IChapter>}
 */
Series.prototype.children = function($) {
  var results = [];
  $('tr.lang_English').find('a[href*=\'/read/\']').map(function(i, el) {
    var address = ($(el).attr('href') || '').trim();
    var scan = scanner($(el).text());
    var identifier = address.match(/_\/([0-9]+)\//i);
    if (address && scan && identifier) {
      results.push(new Chapter(
        address,
        identifier,
        scan.number,
        scan.title || undefined,
        scan.version,
        scan.volume
      ));
    }
  });
  return results.reverse();
};

// Each chapter has url, id, num, title, version, volume

/**
 * Retrieves each genre.
 * @param {?} $
 * @returns {!Array.<string>}
 */
Series.prototype.genres = function($) {
  return $('td:contains(Genres:)+ > a').map(function(i, el) {
    return $(el).text().trim() || undefined;
  }).get();
};

// genres

/**
 * Retrieves the image address.
 * @param {?} $
 * @returns {?string}
 */
Series.prototype.imageAddress = function($) {
  var address = $('img[src*=\'/uploads/\']').first().attr('src');
  return address ? address.trim() : undefined;
};

// Image url

/**
 * Retrieves the summary.
 * @param {?} $
 * @returns {?string}
 */
Series.prototype.summary = function($) {
  var html = $('td:contains(Description:)').next().html() || '';
  var text = $('<div />').html(html.replace(/<br\s*\/?>/g, '\n')).text();
  return text || undefined;
};

// summary

/**
 * Retrieves the title.
 * @param {?} $
 * @returns {?string}
 */
Series.prototype.title = function($) {
  return $('h1.ipsType_pagetitle').text().trim() || undefined;
};

// title

/**
 * Retrieves the type.
 * @param {?} $
 * @returns {?string}
 */
Series.prototype.type = function($) {
  var text = $('td:contains(Type:)').next().text() || '';
  var match = text.match(/^(.*)\s+\(.*\)$/);
  return (match ? match[1].toLowerCase() : text.toLowerCase()) || undefined;
};

// type of manga

module.exports = Series;
