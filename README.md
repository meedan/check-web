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

#### With Docker

If you are just getting started, you probably want to install the full [Check](https://github.com/meedan/check) stack with [Docker](https://www.docker.com/ "Docker - Build, Ship, and Run Any App, Anywhere").

The full Check environment will install Node packages into an invisible
`node_modules/` directory. Instead of using `npm run ...`, run
`docker-compose exec web npm run ...` to run in the Docker container: the
Docker container can see the `node_modules/` directory.

#### Using Dev mode

The dev-mode Docker container will watch for file changes in `src/` and rebuild
whenever a file changes. It will output a message (success or error) after each
rebuild.

## Localization

Translations are managed in [Transifex](https://www.transifex.com/meedan/check-2/). All the contents are stored in the `localization` directory which contains the following subfolders:

* `localization/react-intl`: Contains the files extracted by `babel-plugin-react-intl` (localizable strings)
* `localization/transifex`: Contains the files above, but converted to Transifex JSON format
* `localization/translations`: Contains the translations files downloaded from Transifex in JavaScript format

By default, the application is displayed in the browser's language using the files from `localization` directory.

### Adding a new language

Copy `config-build.js.example` to `config-build.js` (if you don't have it yet) and add your Transifex user and password.

Then you can use `npm run transifex:upload` and `npm run transifex:download` to upload and download translations, respectively.

## Developing

### Maintaining `package-lock.json`

If running within Docker, run
`docker-compose exec web npm install [--save-dev] MODULE [...]`. This will
overwrite `package-lock.json`. Commit and deploy `package-lock.json` alongside
any change to `package.json`.

## Testing

#### Integration tests

*Running*

* Start the test environment in the [check](https://github.com/meedan/check) repo: `docker-compose -f docker-compose.yml -f docker-test.yml up`
* Copy `test/config.yml.example` to `test/config.yml` and set the configurations
* Copy `test/config.js.example` to `test/config.js` and set the configurations
* Run `docker-compose exec web npm test:integration`

*Writing*

* Use API calls (instead of using Selenium) to create all test data you need _before_ the real thing that the test is testing
* Tag the test with one of the existing tags

#### Unit tests

* Run `docker-compose exec web npm run test:unit`

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
