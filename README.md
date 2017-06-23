# Check-web

[![Travis](https://travis-ci.org/meedan/check-web.svg?branch=develop)](https://travis-ci.org/meedan/check-web/)

Verify breaking news online.

## Overview

This is the web client of [Check](https://github.com/meedan/check).

## Dependencies

* [Node.js](https://nodejs.org/en/ "Node.js") (tested with version 6.9.2) and [NPM](https://www.npmjs.com/ "npm") modules as defined in [package.json]()
* [Ruby](https://www.ruby-lang.org/en/downloads/ "Download Ruby") and [RubyGems](https://rubygems.org/ "RubyGems.org | your community gem host") (to run the tests)
* Optional: [Inkscape](https://inkscape.org/en/ "Draw Freely | Inkscape") and [ImageMagick](https://www.imagemagick.org/script/index.php "Convert, Edit, Or Compose Bitmap Images @ ImageMagick") (to generate the favicon)
* Optional: [Guard](https://github.com/guard/guard "GitHub - guard/guard: Guard is a command line tool to easily handle events on file system modifications."), [Guard-Livereload](https://github.com/guard/guard-livereload "GitHub - guard/guard-livereload: Guard::LiveReload automatically reload your browser when files are modified.") and the [LiveReload browser extension](http://livereload.com/extensions/) (for an autorefreshing browser in dev mode)

## Installation

#### With Docker

If you are just getting started, you probably want to install the full [Check](https://github.com/meedan/check) stack with [Docker](https://www.docker.com/ "Docker - Build, Ship, and Run Any App, Anywhere").

*Building and running*

* Copy `config.js.example` to `config.js` and define your configurations
* Execute `./docker/run.sh`
* Enter the container with `./docker/shell.sh` and compile the code (`npm run build`)
* Still inside the container, run the test with `npm run test` (see at the bottom more information on running tests)

*Interacting*

* The directories `build` and `releases` are shared between the host and the container - that's where your compiled code will be located
* The web application will be available locally in port 3333 of the host
* The web application will be available for the world through Ngrok (check `releases/web.log` for the generated URL)
* While you run the tests from inside the container using `npm run test`, you can see what's going on by connecting to VNC, on port 5999 and password "keefer"

#### Using Dev mode

The dev mode build (`npm run build:dev`.) is intended to be used instead of the existing "full build" (`npm run build`) during local development. The dev mode reduces build time primarily by enabling webpack's `watch` feature, which uses caching and auto-rebuilding. It also disables sourcemaps by default.

* Run `npm run build:dev`.
* This runs both a the javascript and Sass compiler. It monitors for changes, automatically triggering a rebuild. Press Ctrl+C to stop.
* The script is defined in [package.json]() — it uses both [gulp](http://gulpjs.com/ "gulp.js") and [webpack](https://webpack.github.io/ "webpack module bundler")

*Dev mode with LiveReload*

In dev mode can optionally use [guard-livereload](https://github.com/guard/guard-livereload) for cross-browser live-reloading, as configured in `check-web/Guardfile`.

* Run `npm run build:dev` per above.
* Install the [LiveReload browser extension](http://livereload.com/extensions/)
* Install Guard and Guard-livereload gems with bundler: `bundle install`
* Run guard: `cd check-app/check-web && bundle exec guard`
* Open localhost:3333 and turn on the browser extension (click it).
* You should see "Browser connected" in the Guard window.
* When you save a .js file, build:dev rebuilds, then Guard notices the new bundle and triggers LiveReload. The page automatically refreshes and reflects your js changes.

#### Installation without Docker

* Copy `config.js.example` to `config.js` and define your runtime configurations
* Copy `config-build.js.example` to `config-build.js` and define your build-time configurations (optional)
* `npm install`
* `npm run build`
* `SERVER_PORT=3333 npm run publish` (which basically serves the contents from `build/web`)
* Open your browser and go to http://localhost:3333
* For better debugging, set your `NODE_ENV` environment variable to `development` instead of `production`.

## Localization

Translations are managed in [Transifex](https://www.transifex.com/meedan/check-2/). All the contents are stored in the `localization` directory. The `localization` directory contains the following sub-folders:

* `react-intl`: Contains the files extracted by `babel-plugin-react-intl` (localizable strings)
* `transifex`: Contains the files above, but converted to Transifex JSON format
* `translations`: Contains the translations files downloaded from Transifex plus a `translations.js` file which concatenates all of them in a single JSON file used by `react-intl`

By default, the application is displayed in the browser's language using the files from `localization` directory. If you want to work with other language or you want to exchange files with Transifex, you need to:

* Add a `locale` entry to your `config.js`. This is the locale for Check. If not present, falls back to browser locale.
* Copy `config-build.js.example` to `config-build.js` (if you don't have it yet) and add your Transifex user and password. If not present, instead of getting translations from Transifex and sending strings to it, it will use the static files at `localization`.

This way, everytime you run `npm run build`, the following flow will happen:

* New translations will be downloaded from Transifex, concatenated into a single JSON and used by the app
* New localizable strings will be extracted from the components (e.g., `<FormattedMessage />` components), converted to Transifex format and uploaded to Transifex

## Testing

#### Running integration tests

* Compile the code with `npm run build`
* Copy `test/config.yml.example` to `test/config.yml` and set the configurations
* Start `chromedriver` and the application (`SERVER_PORT=3333 npm run publish`)
* Run `npm run test:integration`

#### Unit tests

* Run `npm run test:unit`

#### All tests

* Compile the code with `npm run build`
* Copy `test/config.yml.example` to `test/config.yml` and set the configurations
* Start `chromedriver` and the application (`SERVER_PORT=3333 npm run publish`)
* Run `npm run test`

#### Missing tests

If you don't have time to implement an integration test for your feature, please add a pending test for that, like this:

```ruby
it "should do whatever my feature expects" do
  skip("Needs to be implemented")
end
```

In order to implement a pending unit test, do this:

```javascript
it("should do whatever my unit expects");
```

## Notes and tips

* Run `npm install babel-register -g` if you face errors related to `babel-register`
* Remove your `node_modules` directory if you face errors related to `npm install`
