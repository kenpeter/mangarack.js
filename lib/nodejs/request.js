'use strict';
var agent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)'; // Simulate a browser agent
var cheerio = require('cheerio'); // the backend jquery, it is quite useful.
var http = require('http'); // http
var maximum = 5;
var timeout = 10000;
var url = require('url'); // url
var zlib = require('zlib'); // zip lib

/**
 * Requests or populate the resource from a HTTP resource.
 * @param {(string|!{address: string})} resource
 * @param {string} encoding
 * @param {function(Error, string=)} done
 */
module.exports = function(resource, encoding, done) {
  /*
    resource:
    { 
      address: 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/',
      children: [Function] 
    }

    encoding:
    utf-8  

    done:
    [Function] 
  */

  //test
  debugger;

  if (typeof resource === 'string') return _request(resource, encoding, done);

  _populate(resource, encoding, done);

};

/**
 * Creates a callback for a decoded request.
 * @private
 * @param {string} address
 * @param {string} encoding
 * @param {function(Error, string=)}done
 */
function _createRequestCallback(address, encoding, done) {
  return function(err, buffer) {
    //test
    debugger;

    if (err) return done(err);
    var data = buffer.toString(encoding || 'utf8');
    if (!data) return done(new Error('No data: ' + address));
    done(err, data);
  };
}

/**
 * Retrieves the keys containing a function.
 * @private
 * @param {!Object} object
 * @returns {!Array.<string>}
 */
function _functions(object) {
  var map = [];
  for (var key in object) if (typeof object[key] === 'function') map.push(key);
  return map;
}

/**
 * Populates the resource from a HTTP resource.
 * @private
 * @param {!{address: ?string}} resource
 * @param {string} encoding
 * @param {function(Error)} done
 */
function _populate(resource, encoding, done) {
  if (!resource.address) return done(undefined);
  _request(resource.address, encoding, function(err, data) {
    if (err) return done(err);
    var $ = cheerio.load(data);
    _functions(resource).forEach(function(key) {
      resource[key] = resource[key]($);
    });
    resource.address = undefined;
    done(undefined);
  });
}

/**
 * Requests a HTTP resource.
 * @private
 * @param {string} address
 * @param {string} encoding
 * @param {function(Error, string=)} done
 * @param {number=} n
 */
// Request http resource, then 'data' request data, then 'end' compress, then if error
function _request(address, encoding, done, n) {
  
  //test
  debugger;

  /*
    options:
    { 
      protocol: 'http:',
      slashes: true,
      auth: null,
      host: 'mangafox.me',
      port: null,
      hostname: 'mangafox.me',
      hash: null,
      search: null,
      query: null,
      pathname: '/manga/naruto_gaiden_the_seventh_hokage/',
      path: '/manga/naruto_gaiden_the_seventh_hokage/',
      href: 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/' 
    }

  */

  var options = url.parse(address);
  options.headers = {'User-Agent': agent};
  http.get(options, function(res) {

    //test
    debugger;

    // res
    // it is the http object containing lots of info 

    var chunks = [];
    res.on('data', function(chunk) {
      //test
      debugger

      /*
       * chunk
        { 
          '0': 60,
          '1': 33,
          '2': 68,
          '3': 79,
          '4': 67,
          '5': 84,
          '6': 89,
          ...
          length: 1440,
          parent: undefined
        }
      */

      // If data, push data to chunks.
      // So it pushes it for couple of times.
      chunks.push(chunk);
    });
    res.on('end', function() {
      //test
      debugger

      // Chunks: array of json object.
      var buffer = Buffer.concat(chunks);

      // res.headers
      /*
{ server: 'nginx/1.0.15',
  date: 'Thu, 03 Sep 2015 15:07:30 GMT',
  'content-type': 'text/html; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  'set-cookie': 
   [ 'mfsid=lrl2o8e3866l3r2hmjftf0p7f6; path=/; domain=.mangafox.me',
     'mfvb_sessionhash=089cc6fd1f3d3571cd55eb10f83773da; path=/; domain=.mangafox.me',
     'mfvb_lastvisit=1441285553; expires=Thu, 10-Sep-2015 13:05:53 GMT; path=/; domain... (length: 93)',
     'mfvb_lastactivity=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain... (length: 93)' ],
  'cache-control': 'no-cache, must-revalidate',
  pragma: 'no-cache',
  expires: 'Sat, 26 Jul 1997 05:00:00 GMT' }

      */
      var compression = res.headers['content-encoding'];

      var callback = _createRequestCallback(address, encoding, done);
      var location = res.headers.location;
      if (location) return _request(location, encoding, done, n + 1 || 1);

      // Compression
      if (compression === 'gzip') {
        return zlib.gunzip(buffer, callback);
      } else if (compression === 'deflate') {
        return zlib.inflateRaw(buffer, callback);
      } else {
        callback(undefined, buffer);
      }
    });
  }).on('error', function(err) {
    //test
    debugger

    if (n >= maximum) return done(err);
    setTimeout(function() {
      _request(address, encoding, done, n + 1 || 1);
    }, timeout);
  });
}
