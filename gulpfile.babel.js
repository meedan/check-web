import fs from 'fs';
import gulp from 'gulp';
import gutil from 'gulp-util';
import jade from 'gulp-jade';
import rename from 'gulp-rename';
import zip from 'gulp-zip';
import replace from 'gulp-replace';
import bump from 'gulp-bump';
import shell from 'gulp-shell';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import webpackConfig from './webpack/config';
import config from './config.json'

/*
 * Common tasks
 */

gulp.task('replace-webpack-code', () => {
  const replaceTasks = [{
    from: './webpack/replace/JsonpMainTemplate.runtime.js',
    to: './node_modules/webpack/lib/JsonpMainTemplate.runtime.js'
  }, {
    from: './webpack/replace/log-apply-result.js',
    to: './node_modules/webpack/hot/log-apply-result.js'
  }];
  replaceTasks.forEach(task => fs.writeFileSync(task.to, fs.readFileSync(task.from)));
});

/*
 * Build tasks
 */

// Chrome extension

gulp.task('config:build:chrome', () => {
  shell.task('mkdir -p build/chrome 2>/dev/null && touch build/chrome/.gitkeep');
  gulp.src('./src/chrome/extension/manifest.json.example')
  .pipe(bump())
  .pipe(gulp.dest('./src/chrome/extension'));
  
  gulp.src('./src/chrome/extension/manifest.json.example')
  .pipe(replace('Title', 'Checkdesk'))
  .pipe(replace('Description', 'Verify breaking news online'))
  .pipe(rename('manifest.json'))
  .pipe(gulp.dest('./build/chrome'));

  gulp.src('./src/app/config/config.js.example')
  .pipe(rename('config.js'))
  .pipe(gulp.dest('./src/app/config'));
});

gulp.task('webpack:build:chrome', (callback) => {
  webpackConfig.entry = webpackConfig.entryChrome;
  webpackConfig.output.path = webpackConfig.output.pathChrome;
  let myConfig = Object.create(webpackConfig);
  webpack(myConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:build', err);
    }
    gutil.log('[webpack:build]', stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('views:build:chrome', () => {
  gulp.src([
    './src/chrome/views/*.jade',
    '!./src/chrome/views/devtools.jade'
  ])
  .pipe(jade({
    locals: { env: 'prod' }
  }))
  .pipe(gulp.dest('./build/chrome'));
});

gulp.task('copy:build:chrome', () => {
  gulp.src('./src/chrome/extension/manifest.json').pipe(gulp.dest('./build/chrome'));
  gulp.src('./src/assets/**/*').pipe(gulp.dest('./build/chrome'));
});

// Web application

gulp.task('config:build:web', () => {
  gulp.src('./src/app/config/config.js.example')
  .pipe(rename('config.js'))
  .pipe(gulp.dest('./src/app/config'));
});

gulp.task('webpack:build:web', (callback) => {
  webpackConfig.entry = webpackConfig.entryWeb;
  webpackConfig.output.path = webpackConfig.output.pathWeb;
  let myConfig = Object.create(webpackConfig);
  webpack(myConfig, (err, stats) => {
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
});

// Android (tested with Node 4.3.2 (`nvm use 4.3.2`))

gulp.task('build:android', shell.task(
  'cd src/android && npm install && rm -fr android/app/build.gradle android/settings.gradle stylesheet.js android/app/src/main/java/com/checkdesk/MainActivity.java index.android.js android/app/src/main/AndroidManifest.xml android/app/src/main/res/mipmap* && react-native android && cp index.js index.android.js && cp AndroidManifest.xml android/app/src/main/ && cp MainActivity.java android/app/src/main/java/com/checkdesk/ && cp -r ../assets/img/logo/android/* android/app/src/main/res/ && cp ../../build/android/css/stylesheet.js . && cp build.gradle android/app && cp settings.gradle android/ && react-native run-android && npm start && cd -'
));

// Tasks

gulp.task('build:chrome', ['replace-webpack-code', 'config:build:chrome', 'webpack:build:chrome', 'views:build:chrome', 'copy:build:chrome']);
gulp.task('build:web', ['replace-webpack-code', 'config:build:web', 'webpack:build:web', 'views:build:web', 'copy:build:web']);
