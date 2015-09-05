/*
  This is for mangafox series.
*/
'use strict';
var Chapter = require('./chapter'); // Basically, a series contains chapters

/**
 * Represents a series.
 * @constructor
 * @implements {ISeries}
 * @param {string} address
 */
function Series(address) {
  this.address = address;
}

/**
 * Retrieves each artist.
 * @param {?} $
 * @returns {!Array.<string>}
 */
Series.prototype.artists = function($) {
  // We pass $ sign like jquery
  // In href, we have search -> artist
  // .map function   
  return $('a[href*=\'/search/artist/\']').map(function(i, el) {
    return $(el).text().trim() || undefined;
  }).get();
};

/**
 * Retrieves each author.
 * @param {?} $
 * @returns {!Array.<string>}
 */
Series.prototype.authors = function($) {
  // search -> author 
  return $('a[href*=\'/search/author/\']').map(function(i, el) {
    return $(el).text().trim() || undefined;
  }).get();
};

/**
 * Retrieves each child.
 * @param {?} $
 * @returns {!Array.<!IChapter>}
 */
Series.prototype.children = function($) {
  // series has many volumes. 
  var regex = /id=([0-9]+)/i;
  var results = [];
  $('h3.volume').each(function(i, el) {

/*
  el: it is basically a volume containing chapters, and 
  previous, next object, etc  
{ type: 'tag',
  name: 'h3',
  attribs: { class: 'volume' },
  children: 
   [ { data: 'Volume 01',
       type: 'text',
       next: [Object],
       prev: null,
       parent: [Object] },
     { type: 'tag',
       name: 'span',
       attribs: {},
       children: [Object],
       next: null,
       prev: [Object],
       parent: [Object] } ],
  next: null,
  prev: 
   { type: 'tag',
     name: 'span',
     attribs: { class: 'collapse' },
     children: [],
     next: 
      { type: 'tag',
        name: 'h3',
        attribs: [Object],
        children: [Object],
        next: null,
        prev: [Object],
        parent: [Object] },
     prev: null,
     parent: 
      { type: 'tag',
        name: 'div',
        attribs: [Object],
        children: [Object],
        next: [Object],
        prev: [Object],
        parent: [Object] } },
  parent: 
   { type: 'tag',
     name: 'div',
     attribs: { class: 'slide' },
     children: [ [Object], [Object] ],
     next: 
      { type: 'tag',
        name: 'ul',
        attribs: [Object],
        children: [Object],
        next: [Object],
        prev: [Object],
        parent: [Object] },
     prev: 
      { data: '\r\n    ',
        type: 'text',
        next: [Object],
        prev: [Object],
        parent: [Object] },
     parent: 
      { type: 'tag',
        name: 'div',
        attribs: [Object],
        children: [Object],
        next: [Object],
        prev: [Object],
        parent: [Object] } } }

    */

    //test
    debugger;

    // el is the volume, prev, next, etc
    // match is the volume
    var match = $(el).text().trim().match(/^Volume\s(.+)$/i);
    if (!match) return;
    
    $(el).parent().next().find('a[href*=\'/manga/\']').each(function(i, el) {
      // test
      // debugger;

      // el is the chapter.
      // title for each chapter
      var title = $(el).next('span.title').text().trim() || undefined;

      var address_chapter = ($(el).attr('href') || '').trim(); 
      var identifier_chapter = ($(el).parent().prev('a.edit').attr('href') || '').match(regex);
      var number_chapter = parseFloat($(el).text().match(/[0-9\.]+$/));
      var title_chapter = /^Read Onl?ine$/i.test(title) ? undefined : title;
      var volumne_chapter = parseFloat(match[1]);

      results.push(new Chapter(
        address_chapter,
        identifier_chapter,
        number_chapter,
        title_chapter,
        volumne_chapter 
      ));
    });
  });
  return results.reverse();
};

/**
 * Retrieves each genre.
 * @param {?} $
 * @returns {!Array.<string>}
 */
Series.prototype.genres = function($) {
  // href, search -> genres
  return $('a[href*=\'/search/genres/\']').map(function(i, el) {
    return $(el).text().trim() || undefined;
  }).get();
};

/**
 * Retrieves the image address.
 * @param {?} $
 * @returns {?string}
 */
Series.prototype.imageAddress = function($) {
  // img src cover.jpg
  var address = $('img[src*=\'cover.jpg\']').attr('src');
  return address ? address.trim() : undefined;
};

/**
 * Retrieves the summary.
 * @param {?} $
 * @returns {?string}
 */
// piece === each newline sentense in summary.
// result += ' ', we connect them with space. 
Series.prototype.summary = function($) {
  var result = '';
  $('p.summary').text().split('\n').filter(function(piece) {
    piece = piece.trim();
    return !/:$/i.test(piece) && // :$ or From or Source
      !/^From\s+(.+)$/i.test(piece) &&
      !/^\(Source:\s+(.+)\)/i.test(piece);
  }).every(function(piece) {
    if (!piece.trim() && result) return false;
    if (result && !/\s$/.test(result)) result += ' ';
    result += piece.trim();
    return true;
  });
  return result || undefined;
};

/**
 * Retrieves the title.
 * @param {?} $
 * @returns {?string}
 */
Series.prototype.title = function($) {
  var match = $('title').text().match(/^(.+)\s+Manga\s+-/i);
  return match ? match[1].trim() : undefined;
};

/**
 * Retrieves the type.
 * @param {?} $
 * @returns {?string}
 */
// Get the type
Series.prototype.type = function($) {
  var text = $('#title h1').text() || '';
  var match = text.match(/[\w]+$/);
  return (match ? match[0].toLowerCase() : text.toLowerCase()) || undefined;
};

module.exports = Series;
