require 'selenium-webdriver'
require 'yaml'
require 'sinatra/base'

# A webserver for the web app
class Web < Sinatra::Base
  set :port, 3333
  set :public_folder, '../build/web'
  get '/' do
    redirect '/index.html'
  end
end

describe 'app' do

  @driver = @config = nil

  def open_extension
    @driver.action.key_down(:control).send_keys('b').key_up(:control).perform
    sleep 5
    window = @driver.window_handles.last
    @driver.switch_to.window(window)
    sleep 5
  end

  def assert_url
    wait = Selenium::WebDriver::Wait.new(timeout: 5000)
    message = wait.until {
      element = @driver.find_element(:css, '#url')
      element if element.displayed?
    }
    expect(message.text.include?('https://meedan.com/en/')).to be(true)
  end

  def assert_footer
    wait = Selenium::WebDriver::Wait.new(timeout: 5000)
    message = wait.until {
      element = @driver.find_element(:css, 'address')
      element if element.displayed?
    }
    # Assert that the version prefix is in the address in order to test Relay
    expect(message.text.include?(' v')).to be(true)
  end

  def port_open?(port)
    !system("lsof -i:#{port}", out: '/dev/null')
  end

  # Start a webserver for the web app
  
  before :all do
    @web = Thread.new { Web.run! } if port_open?(3333)
  end

  after :all do
    Thread.kill(@web) unless @web.nil?
  end

  # Install the Chrome extension

  before :each do
    @config = YAML.load_file('config.yml')

    Selenium::WebDriver::Chrome.driver_path = './chromedriver'
  
    prefs = {
      extensions: {
        commands: {
          'linux:Ctrl+B' => {
            'command_name' => '_execute_browser_action',
            'extension' => @config['chrome_extension_id'],
            'global' => false
          }
        }
      }
    }

    if port_open?(9515)
      @driver = Selenium::WebDriver.for :chrome, switches: ['--load-extension=../build/chrome'], prefs: prefs
    else
      caps = Selenium::WebDriver::Remote::Capabilities.chrome
      caps['chromeOptions'] = {}
      caps['chromeOptions']['args'] = ['--load-extension=../build/chrome']
      caps['chromeOptions']['prefs'] = prefs
      @driver = Selenium::WebDriver.for :remote, url: 'http://localhost:9515', desired_capabilities: caps
    end
  end

  after :each do
    @driver.quit
  end

  context "chrome extension" do
    
    it "should open extension" do
      @driver.navigate.to 'https://meedan.com/en/'
      open_extension
      assert_url
    end

    it "should have footer" do
      @driver.navigate.to 'https://meedan.com/en/'
      open_extension
      assert_footer
    end

  end

  context "web" do
    
    it "should open page" do
      @driver.navigate.to 'http://localhost:3333/index.html?url=https://meedan.com/en/'
      sleep 3
      assert_url
    end

    it "should have footer" do
      @driver.navigate.to 'http://localhost:3333/index.html?url=https://meedan.com/en/'
      sleep 3
      assert_footer
    end

  end
end
