import fs from 'fs';
import request from 'sync-request';
import gulp from 'gulp';
import gutil from 'gulp-util';
import jade from 'gulp-jade';
import rename from 'gulp-rename';
import transifex from 'gulp-transifex';
import jsonEditor from 'gulp-json-editor';
import webpack from 'webpack';
import mergeTransifex from './webpack/gulp-merge-transifex-translations';
import webpackConfig from './webpack/config';
import buildConfig from './config-build';

let transifexClient = null;
if (buildConfig.transifex) {
  transifexClient = transifex.createClient({
    host: 'www.transifex.com',
    user: buildConfig.transifex.user,
    password: buildConfig.transifex.password,
    project: "check-2",
    i18n_type: "KEYVALUEJSON",
    local_path: "./localization/translations/*/"
  });
}

gulp.task('replace-webpack-code', () => {
  [{
    from: './webpack/replace/JsonpMainTemplate.runtime.js',
    to: './node_modules/webpack/lib/JsonpMainTemplate.runtime.js'
  }, {
    from: './webpack/replace/log-apply-result.js',
    to: './node_modules/webpack/hot/log-apply-result.js'
  }].forEach(task => fs.writeFileSync(task.to, fs.readFileSync(task.from)));
});

gulp.task('relay:copy', () => {
  if (buildConfig.relay.startsWith('http')) {
    const res = request('GET', buildConfig.relay);
    if (res.statusCode < 300) {
      fs.writeFileSync('./relay.json', res.getBody());
    }
  }
  else {
    fs.writeFileSync('./relay.json', fs.readFileSync(buildConfig.relay));
  }
});

gulp.task('webpack:build:web', (callback) => {
  webpackConfig.entry = webpackConfig.entryWeb;
  webpackConfig.output.path = webpackConfig.output.pathWeb;
  webpack(Object.create(webpackConfig), (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:build', err);
    }
    gutil.log('[webpack:build]', stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('views:build:web', () => {
  gulp.src([
    './src/web/views/*.jade',
    '!./src/web/views/devtools.jade'
  ])
  .pipe(jade({
    locals: { env: 'prod' }
  }))
  .pipe(gulp.dest('./build/web'));
});

gulp.task('copy:build:web', () => {
  gulp.src('./src/assets/**/*').pipe(gulp.dest('./build/web'));
  gulp.src('./config.js').pipe(gulp.dest('./build/web/js'));
  gulp.src('./src/assets/newrelic.js').pipe(gulp.dest('./build/web/js'));
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
    return gulp.src('./localization/translations/**/*').pipe(mergeTransifex()).pipe(gulp.dest('./localization/translations/'));
  }
});

gulp.task('transifex:prepare', () => {
  if (transifexClient) {
    gulp.src('./localization/react-intl/**/*').pipe(jsonEditor((inputJson) => {
      let outputJson = {};
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

gulp.task('build:web', ['replace-webpack-code', 'relay:copy', 'webpack:build:web', 'views:build:web', 'copy:build:web']);
