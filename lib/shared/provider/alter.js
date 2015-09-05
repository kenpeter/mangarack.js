/*
  alter, but what

*/
'use strict';

/**
 * Alters numbering to fill in each blank.
 * @param {!Array.<!{number: number}>} children
 */
module.exports = function(children) {
  //test
  // the children already has all chapters.

  children.forEach(function(source) {
    /*
      source:
      { 
        address: 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/v01/c009.1/1.html',
        identifier: 300333,
        number: 9.1,
        title: 'I Will Protect You (Full Color Version)',
        version: 'NaN',
        volume: 1 
      }
    */   
 
    //test
    debugger;

    if (!isNaN(source.number)) return;

    //test
    debugger;

    var computed = _compute(children, source);
    if (Object.keys(computed.difference).length) {
      var clampedPriority = _clamp(_prioritize(computed.difference), 0, 1);
      source.number = computed.previous.number + clampedPriority / 2;
    } else {
      source.number = computed.previous ? computed.previous.number + 0.5 : 0.5;
    }
  });
};

/**
 * Clamps the value to the specified minimum/maximum.
 * @private
 * @param {number} current
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 */
function _clamp(current, minimum, maximum) {
  return Math.min(Math.max(current, minimum), maximum) || maximum;
}

/**
 * Computes the difference.
 * @private
 * @param {!Array.<!{number: number}>} children
 * @param {{number: number}} source
 * @returns {!{difference: Object.<number, number>, previous: {number: number}}}
 */
function _compute(children, source) {
  var count = 0;
  var difference = {};
  var previous;
  children.forEach(function(next) {
    if (next !== source &&
      !isNaN(next.number) &&
      next.volume === source.volume) {
      if (previous) {
        var current = (next.number - previous.number).toFixed(4);
        if (typeof difference[current] === 'undefined') {
          difference[current] = 1;
          count += 1;
        } else {
          difference[current] += 1;
        }
      }
      previous = next;
    }
  });
  return {difference: difference, previous: previous};
}

/**
 * Prioritizes the best difference.
 * @private
 * @param {!Object.<number, number>} difference
 * @returns {number}
 */
function _prioritize(difference) {
  var best = {count: NaN, value: NaN};
  Object.keys(difference).forEach(function(difference) {
    var count = difference[difference];
    if (!isNaN(best.count) && count <= best.count) return;
    best = {count: count, value: parseFloat(difference)};
  });
  return best.value;
}
