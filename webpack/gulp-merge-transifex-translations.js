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

        const txTranslated = JSON.parse(file.contents.toString());

        for (const [key, value] of Object.entries(txTranslated)) {
          translations[lang][key] = value.string;
        }
      }
    }

    return callback();
  }

  return through.obj(directoryMap,
    function (cb) {
      if (!isEmpty(translations)) {
        for (const lang in translations) {
          const contents = JSON.stringify(translations[lang]);
          this.push(new gutil.File({
            cwd: firstFile.cwd,
            base: firstFile.cwd,
            path: path.join(firstFile.cwd, `${lang}.json`),
            contents: Buffer.from(contents),
          }));
          gutil.log('Generated', gutil.colors.blue(`${lang}.json`));
        }

        const contents = JSON.stringify(Object.keys(translations));
        this.push(new gutil.File({
          cwd: firstFile.cwd,
          base: firstFile.cwd,
          path: path.join(firstFile.cwd, 'locales.json'),
          contents: Buffer.from(contents),
        }));
        gutil.log('Generated', gutil.colors.blue('locales.json'));
      }
      return cb();
    }
  );
};
