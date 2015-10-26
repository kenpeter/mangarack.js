/*jshint -W098*/
'use strict';

/**
 * Represents a series.
 * @interface
 */
function ISeries() {
  throw new Error('Not implemented.');
}

// --

/**
 * Contains the address.
 * @type {string}
 */
ISeries.address = String();
// A series needs http address
// Need http address.

// --

/**
 * Retrieves each artist.
 * @param {?} $
 * @returns {!Array.<string>}
 */
ISeries.artists = function($) {
  throw new Error('Not implemented.');
};

// Need someone to draw

/**
 * Retrieves each author.
 * @param {?} $
 * @returns {!Array.<string>}
 */
ISeries.authors = function($) {
  throw new Error('Not implemented.');
};

// Write the story

/**
 * Retrieves each child.
 * @param {?} $
 * @returns {!Array.<IChapter>}
 */
ISeries.children = function($) {
  throw new Error('Not implemented.');
};

// Children: volumne?

/**
 * Retrieves each genre.
 * @param {?} $
 * @returns {!Array.<string>}
 */
ISeries.genres = function($) {
  throw new Error('Not implemented.');
};

// genres == action?

/**
 * Retrieves the image address.
 * @param {?} $
 * @returns {?string}
 */
ISeries.imageAddress = function($) {
  throw new Error('Not implemented.');
};

// image address, you mean the cover?

/**
 * Retrieves the summary.
 * @param {?} $
 * @returns {?string}
 */
ISeries.summary = function($) {
  throw new Error('Not implemented.');
};

// Summary

/**
 * Retrieves the title.
 * @param {?} $
 * @returns {?string}
 */
ISeries.title = function($) {
  throw new Error('Not implemented.');
};

// Title 

/**
 * Retrieves the type.
 * @param {?} $
 * @returns {?string}
 */
ISeries.type = function($) {
  throw new Error('Not implemented.');
};

// Type == ?

// --

module.exports = ISeries;
