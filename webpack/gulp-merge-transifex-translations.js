// Convert files download from Transifex into a single big file with all translations for all languages

var through = require('through2'),
    isEmpty = require('lodash.isempty'),
    path = require('path'),
    gutil = require('gulp-util');

module.exports = function (config) {
  'use strict';

  config = config || {};
  var origin = '/translations.js',
      firstFile,
      languages = [],
      translations = {};

  function directoryMap(file, enc, callback) {
    if (!firstFile) {
      firstFile = file;
    }

    if (file.relative === 'translations.js') {
      // Do nothing if the file is the merged one
    }

    // Language
    else if (file.isDirectory()) {
      const lang = file.relative;
      if (!config.transifex.languages || config.transifex.languages.indexOf(lang) !== -1) {
        languages.push(lang);
        if (translations[lang] == undefined) {
          translations[lang] = {};
        }
      }
    }

    // Translation file
    else if (file.isBuffer()) {
      const parts = file.relative.split('/');
      const lang = parts[0];
      if (!config.transifex.languages || config.transifex.languages.indexOf(lang) !== -1) {
        translations[lang] = Object.assign(translations[lang], JSON.parse(file.contents.toString()))
      }
    }

    return callback();
  }

  return through.obj(directoryMap,
    function (cb) {
      if (!isEmpty(translations)) {
        const contents = JSON.stringify(translations);
        this.push(new gutil.File({
          cwd: firstFile.cwd,
          base: firstFile.cwd,
          path: path.join(firstFile.cwd, origin),
          contents: new Buffer('const translations = ' + contents + ";\n\nmodule.exports = translations;")
        }));

        gutil.log('Generated', gutil.colors.blue(origin));
      }
      return cb();
    }
  );
};
