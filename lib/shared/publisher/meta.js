'use strict';
var regexp = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/g;
var xml2js = require('xml2js');

/**
 * Represents meta information.
 * @constructor
 * @param {!ISeries} series
 * @param {!IChapter} chapter
 */
function Meta(series, chapter) {
  this.genre = series.genres.join(', ');
  this.manga = _isManga(series) ? 'YesAndRightToLeft' : undefined;
  this.number = isNaN(chapter.number) ? undefined : chapter.number;
  this.penciller = series.artists.join(', ');
  this.pages = {page: []};
  this.series = series.title;
  this.summary = series.summary;
  this.title = chapter.title;
  this.volume = isNaN(chapter.volume) ? undefined : chapter.volume;
  this.writer = series.authors.join(', ');
}

/**
 * Loads meta information from xml.
 * @param {string} xml
 * @param {function(Error, Meta=)} done
 */
Meta.load = function(xml, done) {
  xml2js.parseString(xml, {
    explicitArray: false,
    explicitRoot: false
  }, function(err, result) {
    if (err) return done(err);
    var meta = _lowerCamelCase(result, Object.create(Meta.prototype));
    meta.genre = _defaultTo(meta.genre, '');
    meta.number = _defaultTo(meta.number);
    meta.penciller = _defaultTo(meta.penciller, '');
    meta.series = _defaultTo(meta.series);
    meta.summary = _defaultTo(meta.summary);
    meta.title = _defaultTo(meta.title);
    meta.volume = _defaultTo(meta.volume);
    meta.writer = _defaultTo(meta.writer, '');
    done(undefined, meta);
  });
};

/**
 * Add a page to the metadata.
 * @param {string} key
 * @param {?number} number
 */
Meta.prototype.add = function(key, number) {
  this.pages.page.push({$: {
    key: key,
    image: isNaN(number) ? 0 : number || 0,
    type: Boolean(number) ? undefined : 'FrontCover'
  }});
};

/**
 * Export meta information to xml.
 * @returns {string}
 */
Meta.prototype.xml = function() {
  return new xml2js.Builder({
    rootName: 'ComicInfo',
    xmldec: {version: '1.0', encoding: 'utf-8'}
  }).buildObject(_enforceXml(_titleCase(this)));
};

/**
 * Defaults a value.
 * @private
 * @param {*} value
 * @param {*=} defaultValue
 * @returns {*}
 */
function _defaultTo(value, defaultValue) {
  return value || defaultValue;
}

/**
 * Check if the series can be considered to be manga.
 * @private
 * @param {!ISeries} series
 * @returns {boolean}
 */
function _isManga(series) {
  return !series.type || series.type === 'manga';
}

/**
 * Map the source to a duplicate with enforced XML-compatible characters.
 * @private
 * @param {(!Array.<!Object>|!Object)} src
 * @returns {(!Array.<!Object>|!Object)}
 */
function _enforceXml(src) {
  var res = Array.isArray(src) ? [] : {};
  Object.keys(src).forEach(function(x) {
    if (typeof src[x] === 'object') {
      res[x] = _enforceXml(src[x]);
      return;
    }
    res[x] = String(src[x]).replace(regexp, '');
  });
  return res;
}

/**
 * Map the source to a duplicate with lower camel case case keys.
 * @private
 * @param {(!Array.<!Object>|!Object)} src
 * @param {!Object=} destination
 * @returns {(!Array.<!Object>|!Object)}
 */
function _lowerCamelCase(src, destination) {
  var res = destination || (Array.isArray(src) ? [] : {});
  Object.keys(src).forEach(function(x) {
    if (typeof src[x] === 'undefined') return;
    var title = x.charAt(0).toLowerCase() + x.substr(1);
    res[title] = typeof src[x] === 'object' ? _lowerCamelCase(src[x]) : src[x];
  });
  return res;
}

/**
 * Map the source to a duplicate with title case keys.
 * @private
 * @param {(!Array.<!Object>|!Object)} src
 * @returns {(!Array.<!Object>|!Object)}
 */
function _titleCase(src) {
  var res = Array.isArray(src) ? [] : {};
  Object.keys(src).forEach(function(x) {
    if (typeof src[x] === 'undefined') return;
    if (typeof src[x] === 'string' && /^\s*$/.test(src[x])) return;
    var title = x.charAt(0).toUpperCase() + x.substr(1);
    res[title] = typeof src[x] === 'object' ? _titleCase(src[x]) : src[x];
  });
  return res;
}

module.exports = Meta;
