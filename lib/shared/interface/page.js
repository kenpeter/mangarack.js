/*jshint -W098*/
'use strict';

/**
 * Represents a page.
 * @interface
 */
function IPage() {
  throw new Error('Not implemented.');
}

// --

/**
 * Contains the address.
 * @type {string}
 */
IPage.address = String();

// page url address

/**
 * Contains the number.
 * @type {number}
 */
IPage.number = Number();

// page num

// --

/**
 * Retrieves the image address.
 * @param {?} $
 * @returns {(?string|Array.<string>)}
 */
IPage.imageAddress = function($) {
  throw new Error('Not implemented.');
};

// the actual image address

// --

module.exports = IPage;
