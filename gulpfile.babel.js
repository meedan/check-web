import fs from 'fs';
import request from 'sync-request';
import gulp from 'gulp';
import gutil from 'gulp-util';
import rename from 'gulp-rename';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import transifex from 'gulp-transifex';
import jsonEditor from 'gulp-json-editor';
import webpack from 'webpack';
import mergeTransifex from './webpack/gulp-merge-transifex-translations';
import webpackConfig from './webpack/config';
import webpackServerConfig from './webpack/config_server';
import buildConfig from './config-build';

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

gulp.task('replace-webpack-code', (callback) => {
  [{
    from: './webpack/replace/JsonpMainTemplate.runtime.js',
    to: './node_modules/webpack/lib/JsonpMainTemplate.runtime.js',
  }, {
    from: './webpack/replace/log-apply-result.js',
    to: './node_modules/webpack/hot/log-apply-result.js',
  }].forEach(task => fs.writeFileSync(task.to, fs.readFileSync(task.from)));
  callback();
});

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

gulp.task('webpack:build:server', (callback) => {
  webpack(Object.create(webpackServerConfig), (err, stats) => {
    if (err) {
      gutil.log(err.message);
      process.exit(1);
    }
    gutil.log('[webpack:build:server]', stats.toString({ colors: true, chunks: false }));
    callback();
  });
});

gulp.task('webpack:build:web', (callback) => {
  webpack(Object.create(webpackConfig), (err, stats) => {
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

function copy_build_web_config_test_js() {
  return gulp.src('./test/config.js').pipe(gulp.dest('./build/web/js'));
}

gulp.task('copy:build:web', gulp.series(copy_build_web_assets, copy_build_web_config_js));
gulp.task('copy:build:web:test', gulp.series(copy_build_web_assets, copy_build_web_config_test_js));

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

gulp.task('build:web', gulp.series('replace-webpack-code', 'relay:copy', 'webpack:build:web', 'copy:build:web'));
gulp.task('build:server', gulp.series('webpack:build:server'));

// Dev mode — with 'watch' enabled for faster builds
// Webpack only — without the rest of the web build steps.
//
const devConfig = Object.create(webpackConfig);

gulp.task('webpack:build:web:dev', (callback) => {
  // Enable watcher to monitor for changes
  devConfig.watch = true;

  // Don't stop on error
  devConfig.bail = false;

  // Disable sourcemaps, for faster compile
  // (Enable if needed, by commenting this out)
  devConfig.devtool = 'eval';

  webpack(Object.create(devConfig), (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:build', err);
    }
    gutil.log('[webpack:build:web:dev]', stats.toString({
      colors: true,
      hash: false,
      version: false,
      timings: true,
      assets: false,
      chunks: false,
      modules: false,
      reasons: false,
      children: false,
      source: false,
      errors: true,
      errorDetails: false,
      warnings: false,
      publicPath: false,
    }));
  });

  // never call callback()
});

gulp.task('build:web:dev', gulp.series('replace-webpack-code', 'relay:copy', 'webpack:build:web:dev', 'copy:build:web'));

gulp.task('serve:server', (callback) => {
  const app = require('./scripts/server-app');
  const port = process.env.SERVER_PORT || 8000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    // never call callback()
  });
})

gulp.task('serve:dev', gulp.parallel('build:web:dev', 'serve:server'));
