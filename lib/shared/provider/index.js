'use strict';
var alter = require('./alter');
var batoto = require('./batoto');
var kissmanga = require('./kissmanga');
var mangafox = require('./mangafox');
var providers = [batoto, kissmanga, mangafox];

/**
 * Retrieves a series.
 * @param {string} address
 * @returns {ISeries}
 */
module.exports = function(address) {
  var series;
  providers.every(function(provider) {
    // Basically go through providers = [batoto, kissmanga, mangafox]
    // 
    series = provider(address);
    return !Boolean(series);
  });

  //test
  debugger;
  
  // series === { address: 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/' }
  if (series) series.children = _createAlter(series.children);

  /*
    series === 
    { address: 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/',
      children: [Function] }
  */

  return series;
};

/**
 * Adds a provider.
 * @param {function(string): Series} provider
 */
module.exports.add = function(provider) {
  providers.push(provider);
};

/**
 * Creates a function to alter the children.
 * @private
 * @param {function(!Object)} populate
 * @returns {function(!Object)}
 */
function _createAlter(populate) {
  // The first time is assigned the function
  // Second time is called this in series.children
  return function($) {
    //test
    debugger;

    /*
children after populate, it has all chapters.
[ { address: 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/v01/c001/1.html',
    identifier: 288460,
    number: 1,
    title: 'Uchiha Sarada',
    version: 'NaN',
    volume: 1 },
  { address: 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/v01/c001.1/1.html',
    identifier: 295431,
    number: 1.1,
    title: 'Uchiha Sarada(Full Color Version)',
    version: 'NaN',
    volume: 1 },
  { address: 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/v01/c002/1.html',
    identifier: 289987,
    number: 2,
    title: 'The Boy With The Sharingan...!!',
    version: 'NaN',
    volume: 1 }
]
    */
    var children = populate($);
    alter(children);

    // Return children
    /*
    { address: 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/',
      children: [Function] }
    */

    return children;
  };
}
