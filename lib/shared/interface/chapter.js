/*jshint -W098*/
'use strict';

/**
 * Represents a chapter.
 * @interface
 */
function IChapter() {
  throw new Error('Not implemented.');
}

// --

/**
 * Contains the address.
 * @type {string}
 */
IChapter.address = String();
// url address

/**
 * Contains the identifier.
 * @type {?string}
 */
IChapter.identifier = String();
// id


/**
 * Contains the number.
 * @type {number}
 */
IChapter.number = Number();

// page number

/**
 * Contains the title.
 * @type {?string}
 */
IChapter.title = String();
// cahpter title


/**
 * Contains the version.
 * @type {number}
 */
IChapter.version = Number();
// version


/**
 * Contains the number.
 * @type {number}
 */
IChapter.volume = Number();
// volume

// --

/**
 * Retrieves each child.
 * @param {?} $
 * @returns {!Array.<!IPage>}
 */
IChapter.prototype.children = function($) {
  throw new Error('Not implemented.');
};

// Because you cannot do IChapter.children

// --

module.exports = IChapter;
