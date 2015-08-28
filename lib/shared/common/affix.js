'use strict';

/**
 * Affixes zero-padding to the value.
 * @param {(number|string)} value
 * @param {number} length
 * @returns {string}
 */
module.exports = function(value, length) {
  if (typeof value !== 'string') value = String(value); // Always string
  var suffix = value.indexOf('.') !== -1; // if suffix there
  var add = length - (suffix ? value.indexOf('.') : value.length);
  while ((add -= 1) >= 0) value = '0' + value;
  return value;
};
