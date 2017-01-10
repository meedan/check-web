import fs from 'fs';
import gulp from 'gulp';
import gutil from 'gulp-util';
import jade from 'gulp-jade';
import rename from 'gulp-rename';
import webpack from 'webpack';
import webpackConfig from './webpack/config';

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
  gulp.src('./config.js').pipe(gulp.dest('./build/web/js'));
});

gulp.task('copy:build:web:test', () => {
  gulp.src('./src/assets/**/*').pipe(gulp.dest('./build/web'));
  gulp.src('./test/config.js').pipe(gulp.dest('./build/web/js'));
});

gulp.task('build:web', ['replace-webpack-code', 'webpack:build:web', 'views:build:web', 'copy:build:web']);
gulp.task('build:web:test', ['replace-webpack-code', 'webpack:build:web', 'views:build:web', 'copy:build:web:test']);