const fs = require('fs');
const { spawn, exec } = require('child_process');
const request = require('sync-request');
const gulp = require('gulp');
const gutil = require('gulp-util');
const jsonEditor = require('gulp-json-editor');
const webpack = require('webpack');
const app = require('./scripts/server-app');
const mergeTransifex = require('./webpack/gulp-merge-transifex-translations');
const webpackConfig = require('./webpack/config');
const buildConfig = require('./config-build');
const merge = require('gulp-merge-json');

const RelayCommand = [
  'relay-compiler',
  '--src',
  'src/app',
  '--schema',
  'relay.json',
];

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
  const prodConfig = {
    ...webpackConfig,
    mode: 'production',
  };
  webpack(prodConfig, (err, stats) => {
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

gulp.task('transifex:translations', () => gulp.src('./localization/translations/**/*.json').pipe(mergeTransifex(buildConfig)).pipe(gulp.dest('./localization/translations/')));

gulp.task('transifex:prepare:merge', () => gulp.src('./localization/react-intl/**/*').pipe(jsonEditor((inputJson) => {
  const outputJson = {};
  inputJson.forEach((entry) => {
    outputJson[entry.id] = {
      string: entry.defaultMessage,
      developer_comment: entry.description,
    };
  });
  return outputJson;
}))
.pipe(merge({ fileName: 'WebStructured.json' }))
.pipe(gulp.dest('./localization/transifex/')));

gulp.task('transifex:prepare:sort', () => gulp.src('./localization/transifex/WebStructured.json').pipe(jsonEditor((inputJson) => {
  const orderedResource = Object.keys(inputJson).sort().reduce(
    (obj, key) => {
      obj[key] = inputJson[key];
      return obj;
    },
    {}
  );
  return orderedResource;
})).pipe(gulp.dest('./localization/transifex/')));

gulp.task('transifex:prepare', gulp.series('transifex:prepare:merge', 'transifex:prepare:sort'));

function spawnPromise(cmd) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(cmd[0], cmd.slice(1), { stdio: 'inherit' });
    childProcess.on('error', reject);
    childProcess.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`${cmd[0]} exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

gulp.task('react-relay:build', () => spawnPromise(RelayCommand));

gulp.task('build:web', gulp.series('relay:copy', 'react-relay:build', 'webpack:build:web', 'copy:build:web'));

gulp.task('react-relay:build:watch', () => spawnPromise([...RelayCommand, '--watch']));

gulp.task('clean:build:web', (cb) => {
  exec('rm -rf build/web/*', (err, stdout, stderr) => {
    cb();
  });
});

// Dev mode — with 'watch' enabled for faster builds
// Webpack only — without the rest of the web build steps.
gulp.task('webpack:build:web:dev', (callback) => {
  const devConfig = {
    ...webpackConfig,
    bail: (process.env.MODE === 'test'), // Exit on error if on test mode
    mode: 'development', // FIXME: Need to change to "production" to work around Relay update issues related to https://github.com/facebook/relay/issues/2049
    watch: true,
  };

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
    return null; // keep eslint happy
  });

  // never call callback()
});

gulp.task(
  'build:web:dev',
  gulp.series(
    'clean:build:web',
    'relay:copy',
    'copy:build:web',
    'react-relay:build', // before Webpack -- for first run to succeed and not race
    gulp.parallel('react-relay:build:watch', 'webpack:build:web:dev'),
  ),
);

gulp.task('serve:server', (callback) => { // eslint-disable-line no-unused-vars
  const port = process.env.SERVER_PORT || 8000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`); // eslint-disable-line no-console
    // never call callback()
  });
});

gulp.task('serve:dev', gulp.parallel('build:web:dev', 'serve:server'));
