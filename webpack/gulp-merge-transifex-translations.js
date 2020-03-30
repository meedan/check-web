// Convert files download from Transifex into a single big file with all translations for all languages

var through = require('through2'),
    isEmpty = require('lodash.isempty'),
    path = require('path'),
    gutil = require('gulp-util');

module.exports = function (config) {
  'use strict';

  config = config || {};
  var firstFile,
      languages = [],
      translations = {};

  function directoryMap(file, enc, callback) {
    if (!firstFile) {
      firstFile = file;
    }

    // Translation file
    else if (file.isBuffer()) {
      const parts = file.relative.split('/');
      const lang = parts[0];
      if (!config.transifex.languages || config.transifex.languages.indexOf(lang) !== -1) {
        if (!translations[lang]) {
          translations[lang] = {};
        }
        if (languages.indexOf(lang) === -1) {
          languages.push(lang);
        }
        translations[lang] = Object.assign(translations[lang], JSON.parse(file.contents.toString()))
      }
    }

    return callback();
  }

  return through.obj(directoryMap,
    function (cb) {
      if (!isEmpty(translations)) {
        const langs = [];
        for (const lang in translations) {
          langs.push(lang);
          const contents = JSON.stringify(translations[lang]);
          this.push(new gutil.File({
            cwd: firstFile.cwd,
            base: firstFile.cwd,
            path: path.join(firstFile.cwd, `${lang}.js`),
            contents: Buffer.from(`const translations = ${contents}\n\nmodule.exports = translations;`)
          }));
          gutil.log('Generated', gutil.colors.blue(`${lang}.js`));
        }

        const contents = JSON.stringify(langs);
        this.push(new gutil.File({
          cwd: firstFile.cwd,
          base: firstFile.cwd,
          path: path.join(firstFile.cwd, 'locales.js'),
          contents: Buffer.from(`const locales = ${contents}\n\nmodule.exports = locales;`)
        }));
        gutil.log('Generated', gutil.colors.blue('locales.js'));
      }
      return cb();
    }
  );
};
