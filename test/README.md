# Load Testing

Instructions to perform load testing using JMeter.

- Requirements:
  - JMeter installed in Chromedriver docker container (`http://test.localdev.checkmedia.org:5900/`)

- How to use it:
  - Connect to `http://test.localdev.checkmedia.org:5900/` using a Remote Desktop app under `VNC` protocol
  - Open JMeter GUI
  - Open `check-web/test/WorkBenchCheckAPP.jmx` test plan

- Testing Recording (at JMeter GUI):
  - Go to `Thread Group` \ `Recording Controller`
  - Press `clear all the recorded samples` button at the bottom of the screen
  - Go to `Workbench` \ `HTTP(S) Test Script Recorder`
  - Press `start` button at the bottom of the screen
  - Run [Check web client tests] (https://github.com/meedan/check-app/blob/feature/5504-jmeter/README.md#testing)
  - Wait until the test is complete

- Load Testing(at JMeter GUI):
  - Go to `Thread Group`
  - Set load testing parameters
  - Press `Start` button (green arrow icon)
