# Check Web

[![Travis](https://travis-ci.org/meedan/check-web.svg?branch=develop)](https://travis-ci.org/meedan/check-web/)

Verify breaking news online.

## Overview

This is the web client of [Check](https://github.com/meedan/check).

## Dependencies

* [Node.js](https://nodejs.org/en/ "Node.js") (tested with version 6.9.2) and [NPM](https://www.npmjs.com/ "npm") modules as defined in [package.json]()
* [Ruby](https://www.ruby-lang.org/en/downloads/ "Download Ruby") and [RubyGems](https://rubygems.org/ "RubyGems.org | your community gem host") (to run the tests)
* Optional: [Inkscape](https://inkscape.org/en/ "Draw Freely | Inkscape") and [ImageMagick](https://www.imagemagick.org/script/index.php "Convert, Edit, Or Compose Bitmap Images @ ImageMagick") (to generate the favicon)

## Installation

If you are just getting started, you probably want to install the full
[Check](https://github.com/meedan/check) stack with
[Docker](https://www.docker.com/).

The full Check environment will install Node packages into an invisible
`node_modules/` directory. Instead of using `npm run ...`, run
`docker-compose exec web npm run ...` to run in the Docker container: the
Docker container can see the `node_modules/` directory.

## Watching for changes

The dev-mode Docker container will watch for file changes in `src/` and rebuild
whenever a file changes. It will output a message (success or error) after each
rebuild.

## Localization

Translations are managed in [Transifex](https://www.transifex.com/meedan/check-2/).
All the contents are stored in the `localization` directory which contains the
following subfolders:

* `localization/react-intl`: files extracted by `babel-plugin-react-intl` (localizable strings)
* `localization/transifex`: files above, but converted to Transifex JSON format
* `localization/translations`: files downloaded from Transifex in JavaScript format

The application is displayed in the browser's language using the files from the
`localization` directory.

## Developing

### Adding a new language

Copy `config-build.js.example` to `config-build.js` (if you don't have it yet) and
add your Transifex user and password.

Then you can use `npm run transifex:upload` and `npm run transifex:download` to
upload and download translations, respectively.

### Applying css styles

#### Components
Use locally scoped css styles for all components. Reference a css file with `[componentname].module.css` as the naming pattern to automatically enable [css module scoping](https://github.com/css-modules/css-modules).

### Maintaining `package-lock.json`

Run `docker-compose exec web npm install [--save-dev] MODULE [...]`. This will
overwrite `package-lock.json`. Commit and deploy `package-lock.json` alongside
any change to `package.json`.

#### Publishing meedan-maintained modules to npmjs.org

(For Meedan employees.) If:

* You are a member of the [Meedan npmjs org](https://www.npmjs.com/org/meedan); and
* You mean to install a fork of a buggy JavaScript module -- or a _new_ module

Then publish it to npm. Name the module `@meedan/name-of-my-module` (in its
`package.json`) and then `npm publish`. After, you may
`docker-compose exec web npm install [--save-dev] MODULE` to use it in `check-web`.

#### Integration tests

*Running*

* Copy `test/config.yml.example` to `test/config.yml` and set the configurations
* Copy `config.js.example` to `test/config.js` and set the configurations
* Copy `config.js.example` to `config.js` and set the configurations
* Start the test environment in the [check](https://github.com/meedan/check) repository: `docker-compose -f docker-compose.yml -f docker-test.yml up`
* Start the nginx proxy for `web` and `chromedriver` containers
* `docker-compose exec web service nginx start`
* `docker-compose -f docker-compose.yml -f docker-test.yml exec chromedriver service nginx start`
* Run `docker-compose exec web npm test:integration`

For Alegre, Pender and Check API that are executed for the integration tests: for each of them, if there is a branch with the same name as the Check Web branch, it's going to be used. Otherwise, it will use `develop`.

You can run a single integration test this way: `docker-compose exec web bash -c "cd test && rspec --example KEYWORD spec/integration_spec.rb"`.

By default, when a test fails, it's retried up to 3 times on CI and not retried locally. You can control it by using the environment variable `TEST_RETRY_COUNT`. For example, for five attempts: `docker-compose exec web bash -c "cd test && TEST_RETRY_COUNT=5 rspec --example KEYWORD spec/integration_spec.rb"`.

By default, only unit tests will run for branches on Travis other than `develop` or `master`. In order to run all the tests in any branch it's just necessary to include `[full ci]` in your commit message, and the commit doesn't even need to contain anything, for example: `git commit --allow-empty -m '[full ci] Run all integration tests for this branch'`. Furthermore, if you wish to run only the smoke tests, include `[smoke tests]` in your commit message. Similarly, you can add `[similarity tests]` in your commit message to run only the similarity tests.


Tests can also be completely skipped if your commit message contains `[skip ci]` (please note that in this case all continuous integration pipelines will be skipped, including deployments).

*Writing*

* Use API calls (instead of using Selenium) to create all test data you need _before_ the real thing that the test is testing
* Tag the test with one of the existing tags (bins) so that the parallel threads stay balanced

#### Unit tests

* Run all unit tests: `docker-compose exec web npm run test:unit`
* Run a single unit test file:
```
$ docker compose exec web bash
# npm run test:unit TestFileName
> RUNS src/app/components/example/TestFileName.test.js
```
* Run a single unit test:
```
./node_modules/.bin/jest -t KEYWORD path/to/TestFile.test.js
```

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

* Remove your `node_modules` directory if you face errors related to `npm install`
* Change the mode to "production" in `gulpfile.js`, under task `webpack:build:web:dev` if you face Relay Store update issues after mutations, related to this issue: https://github.com/facebook/relay/issues/2049
