module AppSpecHelpers
  def update_field(selector, value)
    wait_for_selector(selector).send_keys(:control, 'a', :delete)
    sleep 0.5
    wait_for_selector(selector).send_keys(value)
  end

  def fill_field(selector, value, type = :css)
    wait_for_selector(selector, type).click
    wait_for_selector(selector, type).send_keys(value)
  end

  def press_button(selector = 'button')
    wait_for_selector(selector).click
  end

  def alert_accept
    @driver.switch_to.alert.accept
    true
  rescue
    sleep 2
    false
  end

  def verbose_wait(minutes = 1)
    minutes.times do |i|
      puts "Waiting... (#{i + 1} / #{minutes})"
      sleep 60
    end
  end

  def wait_for_selector(selector, type = :css, timeout = 20, reload = false, index: 0)
    wait_for_selector_list_size(selector, index + 1, type, timeout, 10, 'unknown', reload)[index]
  end

  def wait_for_selector_list(selector, type = :css, timeout = 20, _test = 'unknown', reload = false, ignore_raise = false)
    elements = []
    attempts = 0
    wait = Selenium::WebDriver::Wait.new(timeout: timeout)
    start = Time.now.to_i
    while elements.empty? && attempts < 3
      attempts += 1
      sleep 0.5
      begin
        retries ||= 0
        wait.until { @driver.find_elements(type, selector).length.positive? }
        elements = @driver.find_elements(type, selector)
        elements.each do |e|
          raise 'Element is not being displayed' unless e.displayed?
        end
      rescue Selenium::WebDriver::Error::StaleElementReferenceError
        sleep 1
        retry if (retries += 1) < 5
      rescue
        # rescue from 'Selenium::WebDriver::Error::TimeOutError:' to give more information about the failure
      end
      @driver.navigate.refresh if reload && elements.empty?
    end
    finish = Time.now.to_i - start
    raise "Could not find element with selector #{type.upcase} '#{selector}' after #{finish} seconds!" if elements.empty? && !ignore_raise

    elements
  end

  def wait_for_selector_list_size(selector, size, type = :css, timeout = 20, retries = 10, test = 'unknown', reload = false, ignore_raise = false)
    elements = []
    attempts = 0
    start = Time.now.to_i
    while elements.length < size && attempts < retries
      attempts += 1
      elements = wait_for_selector_list(selector, type, timeout, test, reload, ignore_raise)
    end
    finish = Time.now.to_i - start
    raise "Could not find #{size} list elements  with selector #{type.upcase} '#{selector}' for test '#{test}' after #{finish} seconds!" if elements.length < size && !ignore_raise

    elements
  end

  def wait_for_selector_none(selector, type = :css, retries = 10, test = 'unknown')
    attempts = 0
    start = Time.now.to_i
    begin
      attempts += 1
      sleep 0.5
      begin
        element = wait_for_selector_list(selector, type, 5) # reduce timeout for checking for lack of element
      rescue
        element = []
        # rescue from Selenium::WebDriver::Error::NoSuchElementError: to give more information about the failure
      end
    end while element.size.positive? && attempts < retries
    finish = Time.now.to_i - start
    raise "Element with selector #{type.upcase} '#{selector}' did not disappear for test '#{test}' after #{finish} seconds!" if element.size.positive?

    element
  end

  def wait_for_text_change(txt, selector, type = :css, count = 10)
    c = 0
    begin
      c += 1
      el = wait_for_selector(selector, type)
      sleep 1
    end while (el.text == txt && c < count)
    el.text
  end

  def wait_for_url_change(old_url, count = 10)
    c = 0
    begin
      c += 1
      current_url = @driver.current_url.to_s
      sleep 1
    end while (old_url == current_url && c < count)
  end

  def wait_for_size_change(size, selector, type = :css, count = 30, test = 'unknown')
    c = 0
    begin
      c += 1
      el = wait_for_selector_list(selector, type, 25, test)
      sleep 3
    end while (size == el.size && c < count)
    el.size
  end

  def agree_to_tos(should_submit = true)
    element = wait_for_selector('#tos__tos-agree', :css)
    unless element.nil?
      @driver.find_element(:css, '#tos__tos-agree').click
      sleep 1
      if should_submit
        @driver.find_element(:css, '#tos__save').click
        sleep 20
      end
    end
    wait_for_selector_none('#tos__save')
  end

  def page_source_body
    @driver.execute_script('return document.body.outerHTML;').to_s
  end

  def console_logs
    require 'pp'
    @driver.manage.logs.get('browser').pretty_inspect
  end

  def create_media(url, wait_for_creation = true)
    # show the side navigation for workspace tipline
    wait_for_selector('#side-navigation__tipline-toggle').click
    wait_for_selector('.projects-list')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('#create-media-button__open-button').click
    fill_field('#create-media-input', url)
    press_button('#create-media-button__submit-button')
    wait_for_selector_none('#create-media-input', :css, 1)
    wait_for_selector('#side-navigation__tipline-toggle').click
    wait_for_selector('.cluster-card a') if wait_for_creation
  end

  def create_image(file)
    # show the side navigation for workspace tipline
    @driver.navigate.to "#{@config['self_url']}/#{@slug}/all-items"
    wait_for_selector('.projects-list')
    wait_for_selector('.projects-list__all-items').click
    wait_for_selector('#create-media-button__open-button').click
    wait_for_selector('#create-media-dialog-form .int-uploadfile__dropzone-without-file')
    wait_for_selector('#create-media-dialog-form input[type=file]').send_keys(File.join(File.dirname(__FILE__), file.to_s))
    wait_for_selector('#create-media-dialog-form .int-uploadfile__dropzone-with-file')
    wait_for_selector('#create-media-button__submit-button').click
    wait_for_selector_none('#create-media-dialog-form .int-uploadfile__dropzone-with-file')
    wait_for_selector('#side-navigation__tipline-toggle').click
  end

  def team_url(path)
    "#{@config['self_url']}/#{get_team}/#{path}"
  end

  def create_claim_and_go_to_search_page
    login_with_email
    wait_for_selector('#input')
    create_media('My search result')
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  def get_config(config_variable)
    ENV[config_variable] || @config[config_variable]
  end

  def save_screenshot(title, driver = nil)
    path = "/tmp/#{(0...8).map { rand(65..90).chr }.join}.png"
    if driver
      driver.save_screenshot(path)
    else
      @driver.save_screenshot(path)
    end
    auth_header = { 'Authorization' => "Client-ID #{get_config('IMGUR_CLIENT_ID')}" }
    image = Base64.strict_encode64(File.open(path).read)
    body = { image: image, type: 'base64' }
    count = 0
    begin
      count += 1
      response = HTTParty.post('https://api.imgur.com/3/image', body: body, headers: auth_header)
      sleep 10
    end while (JSON.parse(response.body)['status'] != 200 && count < 3)
    if JSON.parse(response.body)['status'] == 200
      JSON.parse(response.body)['data']['link']
    else
      "Failed to upload to imgur: '#{response.body}'"
    end
  rescue Exception => e
    "(couldn't take screenshot for '#{title}', error was: '#{e.message}')"
  end

  def new_driver(chrome_prefs: {}, extra_chrome_args: [])
    proxy = if @config.key?('proxy')
              Selenium::WebDriver::Proxy.new(
                http: @config['proxy'],
                ftp: @config['proxy'],
                ssl: @config['proxy']
              )
            end

    extensions = begin
      [Base64.strict_encode64(File.open('./extension.crx', 'rb').read)]
    rescue Errno::ENOENT
      []
    end

    chrome_args = %w[disable-gpu no-sandbox disable-dev-shm-usage --window-size=1320,850]

    chrome_options = {
      extensions: extensions,
      prefs: chrome_prefs,
      args: chrome_args + extra_chrome_args
    }

    desired_capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(
      proxy: proxy,
      'goog:chromeOptions': chrome_options
    )

    client = Selenium::WebDriver::Remote::Http::Default.new
    # Make client timeout longer than the server timeout
    client.open_timeout = 180 # seconds
    client.read_timeout = 180 # seconds
    Selenium::WebDriver.for(:chrome, desired_capabilities: desired_capabilities, url: @webdriver_url, http_client: client)
  end

  def generate_a_report_and_copy_report_code
    wait_for_selector('#media-detail__report-designer').click
    wait_for_selector('.report-designer__copy-embed-code').click
  end

  def change_the_status_to(status_class, confirm)
    wait_for_selector('.media-card-large')
    wait_for_selector('.media-status__current').click
    wait_for_selector('.media-status__menu-item')
    wait_for_selector(status_class).click
    wait_for_selector('.media-status__proceed-send').click if confirm && status_class != '.media-status__menu-item--in-progress'
    wait_for_selector_none('.media-status__menu-item')
  end

  def add_image_note(image_file)
    wait_for_selector('textarea')
    wait_for_selector('.task__log-icon > svg').click
    wait_for_selector('.add-annotation')
    wait_for_selector('.add-annotation__insert-photo').click
    wait_for_selector('.int-uploadfile__dropzone-without-file')
    input = wait_for_selector('input[type=file]')
    input.send_keys(File.join(File.dirname(__FILE__), image_file))
    wait_for_selector('#remove-image')
    wait_for_selector('button[type=submit]').click
    wait_for_selector('.annotation__card-thumbnail')
  end

  def add_related_item(item_name)
    wait_for_selector('#create-media-dialog__dismiss-button')
    wait_for_selector('#autocomplete-media-item').send_keys(item_name)
    wait_for_text_change(' ', '#autocomplete-media-item', :css)
    wait_for_selector('.autocomplete-media-item__select').click
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector_none('#create-media-dialog__dismiss-button')
    @driver.navigate.refresh
  end

  def add_article_to_item
    wait_for_selector('.media-card-large')
    wait_for_selector('#articles-sidebar-team-articles')
    wait_for_selector('.media-articles-card__card').click
    wait_for_selector('.article-card')
  end
end
