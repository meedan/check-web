# Checkdesk

Verify breaking news online

## Dependencies

* Node.js (tested with version 4.3.2)
* Inkscape and ImageMagick (to generate the icons)
* Ruby and RubyGems (to run the tests)

## Structure

- `src/app`: React cross-browser application.
- `src/chrome`: Sources for the Google Chrome extension.
- `src/web`: Sources for the web application.
- `src/android`: Sources for the Android application.

## How to install

* Copy `config.json.example` to `config.json` and define your configurations
* `npm install react-native react-native-css ngrok -g`
* `npm install`
* `npm rebuild node-sass`

### Running on Docker

*Building and running*

* Copy `config.json.example` to `config.json` and define your configurations
* Execute `./docker/run.sh`
* Enter the container with `./docker/shell.sh` and compile the code (`PLATFORM=web npm run build`, `PLATFORM=chrome npm run build`, etc.)
* Still inside the container, run the test with `npm run test` (see at the bottom more information on running tests) 

*Interacting*

* The directories `build` and `releases` are shared between the host and the container - that's where your compiled code will be located
* The web application will be available locally in port 3333 of the host
* The web application will be available for the world through Ngrok (check `releases/web.log` for the generated URL)
* While you run the tests from inside the container using `npm run test`, you can see what's going on by connecting to VNC, on port 5999 and password "keefer" 

## How to build

* `PLATFORM=<chrome|web|android> npm run build`

## How to develop

* The theme files (SASS files) are under `src/app/styles`
* Other development files are under `src/app/`
* In order to reflect your changes, run `PLATFORM=<chrome|web|android> npm run build`
* In order to use the Relay features, add the `relay.json` file to `data/` directory

## How to use

### Chrome extension

* Go to Google Chrome / Chromium
* Type `chrome://extensions`
* Hit "Load unpacked extension..."
* Choose the `build/chrome` directory
* An icon will be added to your Google Chrome toolbar

### Web

* Start a webserver in `build/web` (or run `PLATFORM=web npm run publish`)

### Android application

* Run `PLATFORM=android npm run build` and the APK will be compiled and sent to your device (real or virtual)

## How to release a new version

* Run `PLATFORM=<chrome|web> npm run release`, which will bump version number and create zip files under `releases/` directory

## How to publish a new version

* Run `PLATFORM=<chrome|web> npm run publish`, which will upload and publish the item to the internet (e.g., Chrome extension to Chrome store or a Ngrok server for the web app)

## How to test

* Run `npm run test` (you need `ruby` and `rubygems`, and need a file `test/config.yml`)
* In order to test the browser extension, you need to add its id to `test/config.yml`, and to find out the id you need to install the extension in Google Chrome in developer mode, so you'll be able to see the id in `chrome://extensions`

## Notes and tips
* run `npm outdated --depth=0 | grep -v Package | awk '{print $1}' | xargs -I% npm install --save %@latest` to update package.json with latest versions of dependancies 
