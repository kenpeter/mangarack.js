/*jshint -W098*/
'use strict';

/**
 * Represents an agent.
 * @interface
 */
function IAgent() { // IAgent
  throw new Error('Not implemented.');
}


/**
 * Adds a page from a HTTP resource.
 * @param {string} address
 * @param {number=} number
 * @param {function(Error, ?boolean)} done
 */
IAgent.add = function(address, number, done) {
  throw new Error('Not implemented.');
};
// Visit a http resource, then input it into a page
// address == http address
// number == page number

/**
 * Marks a page as disposed.
 * @param {number} number
 * @param {function(Error, boolean=)} done
 */
IAgent.dispose = function(number, done) {
  throw new Error('Not implemented.');
};

// Add vs dispose
// Dispose page number

/**
 * Populates the resource from a HTTP resource.
 * @param {!{address: ?string}} resource
 * @param {string} encoding
 * @param {function(Error)} done
 */
IAgent.populate = function(resource, encoding, done) {
  throw new Error('Not implemented.');
};

// resource, not really a http resource
// encoding == utf-8

/**
 * Publishes the mediated result.
 * @param {function(Error)} done
 */
IAgent.publish = function(done) {
  throw new Error('Not implemented.');
};

// Publish page result?

module.exports = IAgent;
