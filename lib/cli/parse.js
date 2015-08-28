'use strict'; /* So basically put strict in every file */
var Command = require('commander').Command;

/**
 * Parses options based on the arguments.
 * @param {!Array.<string>} args
 * @returns {!IOptions}
 */
module.exports = function(args) {
  // mangarack.js/lib/cli/package.json
  // "version": "3.1.6" in json
  // so require('whatever in json').version
  // Command().version has build-in
  return new Command().version(require('../../package').version)
    // Disables
    .option('-a, --animation', 'Disable image animation framing.')
    .option('-d, --duplication', 'Disable duplication detection.')
    .option('-f, --footer', 'Disable image footer cropping (MangaFox-only).')
    .option('-g, --generalize', 'Disable image generalization.')
    .option('-j, --jacket', 'Disable the comic book jacket/cover.') // Cover
    .option('-m, --meta', 'Disable metadata.') // Meta data
    .option('-p, --persistent', 'Disable persistent synchronization.')
    // Filters
    .option('-c, --chapter <n>', 'The chapter filter.') // <n> takes value
    .option('-v, --volume <n>', 'The volume filter.')
    // Settings
    .option('-e, --extension <s>', 'The file extension. (Default: cbz)') // File extension
    .option('-k, --keep-alive', 'Keeps the process alive on a task error.')
    .option('-o, --output <s>', 'The output directory.') // Output directory
    .option('-s, --source <s>', 'The source file. (Default: MangaRack.txt)') // Put more series in MangaRack.txt
    .option('-t, --transform <s>', 'The image transformation output.')
    .option('-w, --workers <n>', 'The maximum workers. (Default: # cores)') // Workers
    // Gary: debug
    .option('-z, --debug', 'Turn on my debug')
    .parse(args); // .parse is the last
};
