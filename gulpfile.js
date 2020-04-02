const fs = require('fs');
const request = require('sync-request');
const gulp = require('gulp');
const gutil = require('gulp-util');
const transifex = require('gulp-transifex');
const jsonEditor = require('gulp-json-editor');
const webpack = require('webpack');
const mergeTransifex = require('./webpack/gulp-merge-transifex-translations');
const webpackConfig = require('./webpack/config');
const buildConfig = require('./config-build');

let transifexClient = null;
if (buildConfig.transifex) {
  transifexClient = transifex.createClient({
    host: 'www.transifex.com',
    user: buildConfig.transifex.user,
    password: buildConfig.transifex.password,
    project: buildConfig.transifex.project,
    i18n_type: 'KEYVALUEJSON',
    local_path: './localization/translations/*/',
  });
}

gulp.task('relay:copy', (callback) => {
  if (buildConfig.relay.startsWith('http')) {
    const res = request('GET', buildConfig.relay);
    if (res.statusCode < 300) {
      fs.writeFile('./relay.json', res.getBody(), callback);
    }
  } else {
    fs.writeFile('./relay.json', fs.readFileSync(buildConfig.relay), callback);
  }
});

gulp.task('webpack:build:web', (callback) => {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      gutil.log(err.message);
      process.exit(1);
    }
    gutil.log('[webpack:build:web]', stats.toString({ colors: true, chunks: false }));
    callback();
  });
});

function copy_build_web_assets() {
  return gulp.src('./src/assets/**/*').pipe(gulp.dest('./build/web'));
}

function copy_build_web_config_js() {
  return gulp.src('./config.js').pipe(gulp.dest('./build/web/js'));
}

gulp.task('copy:build:web', gulp.series(copy_build_web_assets, copy_build_web_config_js));

gulp.task('transifex:download', () => {
  return gulp.src('./localization/transifex/**/*.json').pipe(transifexClient.pullResource());
});

gulp.task('transifex:translations', () => {
  return gulp.src('./localization/translations/**/*.json').pipe(mergeTransifex(buildConfig)).pipe(gulp.dest('./localization/translations/'));
});

gulp.task('transifex:prepare', () => {
  return gulp.src('./localization/react-intl/**/*').pipe(jsonEditor((inputJson) => {
    const outputJson = {};
    inputJson.forEach((entry) => {
      outputJson[entry.id] = entry.defaultMessage;
    });
    return outputJson;
  })).pipe(gulp.dest('./localization/transifex/'));
});

gulp.task('transifex:upload', () => {
  return gulp.src('./localization/transifex/**/*').pipe(transifexClient.pushResource());
});

gulp.task('transifex:languages', () => {
  transifexClient.languages((data) => {
    console.log(JSON.stringify(data));
  });
  return gulp.series();
});

gulp.task('build:web', gulp.series('relay:copy', 'webpack:build:web', 'copy:build:web'));

// Dev mode — with 'watch' enabled for faster builds
// Webpack only — without the rest of the web build steps.
gulp.task('webpack:build:web:dev', (callback) => {
  const devConfig = {
    ...webpackConfig,
    bail: false, // don't stop on error
    watch: true,
  }

  webpack(devConfig, (err, stats) => {
    if (err) {
      return callback(new gutil.PluginError('webpack:build', err));
    }
    gutil.log('[webpack:build:web:dev]', stats.toString({
      colors: true,
      hash: false,
      version: false,
      timings: true,
      assets: true,
      chunks: false,
      modules: false,
      reasons: false,
      children: false,
      source: false,
      errors: true,
      errorDetails: true,
      warnings: true,
      publicPath: false,
    }));
  });

  // never call callback()
});

gulp.task('build:web:dev', gulp.series('relay:copy', 'copy:build:web', 'webpack:build:web:dev'));

gulp.task('serve:server', (callback) => {
  const app = require('./scripts/server-app');
  const port = process.env.SERVER_PORT || 8000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    // never call callback()
  });
})

gulp.task('serve:dev', gulp.parallel('build:web:dev', 'serve:server'));
