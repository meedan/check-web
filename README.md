# Checkdesk

Verify breaking news online

## Dependencies

* Node.js (tested with version 4.3.2)
* Inkscape and ImageMagick (to generate the favicon)
* Ruby and RubyGems (to run the tests)

## Structure

* `src/app`: Application code
* `src/app/styles`: Theme (SASS) files

## How to use it

* Copy `config.js.example` to `config.js` and define your configurations
* `npm install`
* `npm run build`
* `npm run publish` (which basically serves the contents from `build/web`)
* Open your browser and go to http://localhost:3333

### Running on Docker

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

## How to test

* Compile the code with `npm run build`
* Copy `test/config.yml.example` to `test/config.yml` and set the configurations 
* Run `npm run test`
