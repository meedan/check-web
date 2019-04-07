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

gulp.task('replace-webpack-code', () => {
  [{
    from: './webpack/replace/JsonpMainTemplate.runtime.js',
    to: './node_modules/webpack/lib/JsonpMainTemplate.runtime.js',
  }, {
    from: './webpack/replace/log-apply-result.js',
    to: './node_modules/webpack/hot/log-apply-result.js',
  }].forEach(task => fs.writeFileSync(task.to, fs.readFileSync(task.from)));
});

gulp.task('relay:copy', () => {
  if (buildConfig.relay.startsWith('http')) {
    const res = request('GET', buildConfig.relay);
    if (res.statusCode < 300) {
      fs.writeFileSync('./relay.json', res.getBody());
    }
  } else {
    fs.writeFileSync('./relay.json', fs.readFileSync(buildConfig.relay));
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
  webpackConfig.entry = webpackConfig.entryWeb;
  webpackConfig.output.path = webpackConfig.output.pathWeb;
  webpack(Object.create(webpackConfig), (err, stats) => {
    if (err) {
      gutil.log(err.message);
      process.exit(1);
    }
    gutil.log('[webpack:build:web]', stats.toString({ colors: true, chunks: false }));
    callback();
  });
});

gulp.task('copy:build:web', () => {
  gulp.src('./src/assets/**/*').pipe(gulp.dest('./build/web'));
  gulp.src('./config.js').pipe(gulp.dest('./build/web/js'));
});

gulp.task('copy:build:web:test', () => {
  gulp.src('./src/assets/**/*').pipe(gulp.dest('./build/web'));
  gulp.src('./test/config.js').pipe(gulp.dest('./build/web/js'));
});

gulp.task('transifex:download', () => {
  if (transifexClient) {
    return gulp.src('./localization/transifex/**/*.json').pipe(transifexClient.pullResource());
  }
});

gulp.task('transifex:translations', () => {
  if (transifexClient) {
    return gulp.src('./localization/translations/**/*').pipe(mergeTransifex(buildConfig)).pipe(gulp.dest('./localization/translations/'));
  }
});

gulp.task('transifex:prepare', () => {
  if (transifexClient) {
    gulp.src('./localization/react-intl/**/*').pipe(jsonEditor((inputJson) => {
      const outputJson = {};
      inputJson.forEach((entry) => {
        outputJson[entry.id] = entry.defaultMessage;
      });
      return outputJson;
    })).pipe(gulp.dest('./localization/transifex/'));
  }
});

gulp.task('transifex:upload', () => {
  if (transifexClient) {
    return gulp.src('./localization/transifex/**/*').pipe(transifexClient.pushResource());
  }
});

gulp.task('transifex:languages', () => {
  if (transifexClient) {
    transifexClient.languages((data) => {
      console.log(JSON.stringify(data));
    });
  }
});

gulp.task('build:web', ['replace-webpack-code', 'relay:copy', 'webpack:build:web', 'copy:build:web']);
gulp.task('build:server', ['webpack:build:server']);

// Dev mode — with 'watch' enabled for faster builds
// Webpack only — without the rest of the web build steps.
//
const devConfig = Object.create(webpackConfig);

gulp.task('webpack:build:web:dev', () => {
  // Duplicated from the regular build
  devConfig.entry = devConfig.entryWeb;
  devConfig.output.path = devConfig.output.pathWeb;

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
});

gulp.task('build:web:dev', ['replace-webpack-code', 'relay:copy', 'webpack:build:web:dev', 'copy:build:web']);
