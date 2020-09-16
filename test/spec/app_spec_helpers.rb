module AppSpecHelpers
  def update_field(selector, value, type = :css, visible = true)
    wait_for_selector(selector).send_keys(:control, 'a', :delete)
    sleep 0.5
    wait_for_selector(selector).send_keys(value)
  end

  def fill_field(selector, value, type = :css, visible = true)
    wait_for_selector(selector,type).send_keys(value)
  end

  def press_button(selector = 'button', type = :css)
    wait_for_selector(selector).click
  end

  def alert_accept
    begin
      @driver.switch_to.alert.accept
      return true
    rescue => e
      sleep 2
      return false
    end
  end

  def wait_for_selector(selector, type = :css, timeout = 20, index: 0)
    wait_for_selector_list_size(selector, index + 1, type)[index]
  end

  def wait_for_selector_list(selector, type = :css, timeout = 20, test = 'unknown')
    elements = []
    attempts = 0
    wait = Selenium::WebDriver::Wait.new(:timeout => timeout)
    start = Time.now.to_i
    while elements.empty? && attempts < 2 do
      attempts += 1
      sleep 0.5
      begin
        wait.until { @driver.find_elements(type, selector).length > 0 }
        elements = @driver.find_elements(type, selector)
        elements.each do |e|
          raise "element is not being displayed" unless  e.displayed?
        end
      rescue
        # rescue from 'Selenium::WebDriver::Error::TimeOutError:' to give more information about the failure
      end
    end
    finish = Time.now.to_i - start
    raise "Could not find element with selector #{type.upcase} '#{selector}' after #{finish} seconds!" if elements.empty?
    elements
  end

  def wait_for_selector_list_size(selector, size, type = :css, retries = 10, test = 'unknown')
    elements = []
    attempts = 0
    start = Time.now.to_i
    while elements.length < size && attempts < retries do
      attempts += 1
      elements = wait_for_selector_list(selector, type)
    end
    finish = Time.now.to_i - start
    raise "Could not find #{size} list elements  with selector #{type.upcase} '#{selector}' for test '#{test}' after #{finish} seconds!" if elements.length < size
    elements
  end

  def wait_for_selector_none(selector, type = :css, retries = 10, test = 'unknown')
    attempts = 0
    start = Time.now.to_i
    begin
      attempts += 1
      sleep 0.5
      begin
        element = wait_for_selector_list(selector, type)
      rescue
        element = []
        #rescue from Selenium::WebDriver::Error::NoSuchElementError: to give more information about the failure
      end
    end while element.size > 0 && attempts < retries
    finish = Time.now.to_i - start
    raise "Element with selector #{type.upcase} '#{selector}' did not disappear for test '#{test}' after #{finish} seconds!" if element.size > 0
    element
  end

  def wait_for_text_change(txt, selector, type = :css, count = 10)
    c = 0
    begin
      c = c + 1
      el = wait_for_selector(selector, type)
      sleep 1
    end while (el.text == txt and c < count)
    el.text
  end

  def wait_for_size_change(s, selector, type = :css, count = 30, test = 'unknown')
    c = 0
    begin
      c += 1
      el = wait_for_selector_list(selector, type, 25, test)
      sleep 3
    end while (s == el.size and c < count)
    el.size
  end

  def agree_to_tos(should_submit = true)
    element = wait_for_selector('#tos__tos-agree', :css)
    if element != nil
      @driver.find_element(:css, '#tos__tos-agree').click
      sleep 1
      @driver.find_element(:css, '#tos__pp-agree').click
      sleep 1
      if should_submit
        @driver.find_element(:css, '#tos__save').click
        sleep 20
      end
    end
    wait_for_selector_none("#tos__save")
  end

  def create_team
    if @driver.find_elements(:css, '.create-team').size > 0
      if @driver.find_elements(:css, '.find-team-card').size > 0
        el = wait_for_selector('.find-team__toggle-create')
        el.click
      end
      fill_field('#team-name-container', "Team #{Time.now}")
      fill_field('#team-slug-container', "team#{Time.now.to_i}#{Process.pid}")
      press_button('.create-team__submit-button')
      sleep 0.5
    end
    @driver.navigate.to @config['self_url']
    sleep 0.5
  end

  def get_team
    @driver.execute_script('var context = Check.store.getState().app.context; return context.team ? context.team.slug : context.currentUser.current_team.slug').to_s
  end

  def get_project
    @driver.execute_script('return Check.store.getState().app.context.project.dbid').to_s
  end

  def console_logs
    require 'pp'
    @driver.manage.logs.get("browser").pretty_inspect
  end

  def create_media(url, wait_for_creation = true)
    wait_for_selector("#create-media__add-item").click
    fill_field('#create-media-input', url)
    press_button('#create-media-dialog__submit-button')
    wait_for_selector_none("#create-media-input")
    wait_for_selector(".media__heading a") if wait_for_creation
  end

  def create_image(file)
    wait_for_selector('#create-media__add-item').click
    wait_for_selector("#create-media__image").click
    wait_for_selector(".without-file")
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), "#{file}"))
    wait_for_selector(".with-file")
    wait_for_selector("#create-media-dialog__submit-button").click
    wait_for_selector_none(".with-file")
  end

  def team_url(path)
    @config['self_url'] + '/' + get_team + '/' + path
  end

  def create_team_and_go_to_settings_page(team)
    api_create_team(team: team)
    @driver.navigate.to @config['self_url'] + '/' + team + '/settings'
    wait_for_selector(".team__privacy")
  end

  def create_claim_and_go_to_search_page
    login_with_email
    wait_for_selector("#input")
    create_media('My search result')
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  def create_team_project_and_image_and_redirect_to_media_page
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('#create-media__add-item').click
    wait_for_selector("#create-media__image").click
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'test.png'))
    wait_for_selector_none(".without-file")
    wait_for_selector("#create-media-dialog__submit-button").click
    wait_for_selector('.medias__item')
    wait_for_selector(".media__heading a").click
    wait_for_selector(".media__annotations-column")
  end

  def save_screenshot(title)
    path = '/tmp/' + (0...8).map{ (65 + rand(26)).chr }.join + '.png'
    @driver.save_screenshot(path)

    auth_header =  {'Authorization' => 'Client-ID ' + @config['imgur_client_id']}
    image = File.new(path)
    body = {image: image, type: 'file'}
    response = HTTParty.post('https://api.imgur.com/3/upload', body: body, headers: auth_header)
    JSON.parse(response.body)['data']['link']
  end

  def wait_page_load(options = {})
    driver = options[:driver] || @driver
    item = options[:item] || "root"
    @wait.until {driver.page_source.include?(item) }
  end

  def go(new_url)
    if defined? $caller_name and $caller_name.length > 0
      method_id = $caller_name[0]
        .gsub(/\s/, '_')
        .gsub(/"|\[|\]/, '')
      if new_url.include? '?'
        new_url = new_url + '&test_id='+method_id
      else
        new_url = new_url + '?test_id='+method_id
      end
    end
    @driver.navigate.to new_url
  end

  def new_driver(chrome_prefs: {}, extra_chrome_args: [])
    proxy = if @config.key?('proxy')
      Selenium::WebDriver::Proxy.new(
        http: @config['proxy'],
        ftp: @config['proxy'],
        ssl: @config['proxy']
      )
    else
      nil
    end

    extensions = begin
      [ Base64.strict_encode64(File.open('./extension.crx', 'rb').read) ]
    rescue Errno::ENOENT
      []
    end

    chrome_args = %w(disable-gpu no-sandbox disable-dev-shm-usage)

    chrome_options = {
      extensions: extensions,
      prefs: chrome_prefs,
      args: chrome_args + extra_chrome_args,
    }

    desired_capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(
      proxy: proxy,
      'goog:chromeOptions': chrome_options,
    )

    Selenium::WebDriver.for(:chrome, desired_capabilities: desired_capabilities, url: @webdriver_url)
  end

  def install_bot (team, bot_name)
    api_create_bot
    @driver.navigate.to @config['self_url'] + '/' + team
    wait_for_selector('.team-menu__team-settings-button').click
    wait_for_selector('.team-settings__bots-tab').click
    # Install bot
    wait_for_selector('#team-bots__bot-garden-button').click
    wait_for_selector(".bot-garden__bot-name")
    bot = wait_for_selector("//span[contains(text(), '#{bot_name}')]", :xpath)
    bot.click
    wait_for_selector('#bot__install-button').click
    @driver.navigate.to @config['self_url'] + '/' + team
  end

  def generate_a_report_and_copy_report_code
    wait_for_selector('#media-detail__report-designer').click
    wait_for_selector('.report-designer__actions-copy').click
  end

  def change_the_status_to(status_class, confirm)
    wait_for_selector(".media-detail")
    wait_for_selector(".media-status__current").click
    wait_for_selector(".media-status__menu-item")
    wait_for_selector(status_class).click
    if confirm
      wait_for_selector(".media-status__proceed-send").click unless (status_class == ".media-status__menu-item--in-progress")
    end
    wait_for_selector_none(".media-status__menu-item")
  end

  def add_image_note(image_file)
    wait_for_selector("textarea")
    wait_for_selector(".task__log-icon > svg").click
    wait_for_selector(".add-annotation")
    wait_for_selector(".add-annotation__insert-photo").click
    wait_for_selector(".without-file")
    input = wait_for_selector('input[type=file]')
    input.send_keys(File.join(File.dirname(__FILE__), image_file))
    wait_for_selector("#remove-image")
    wait_for_selector('button[type=submit]').click
    wait_for_selector(".annotation__card-thumbnail")
  end

  def create_team_data_field(params ={})
    wait_for_selector(".team__primary-info")
    create_task(params)
  end

  def edit_team_data_field(new_data_field_name)
    wait_for_selector('.create-task__add-button')
    wait_for_selector(".team-tasks__menu-item-button").click
    wait_for_selector(".team-tasks__edit-button").click
    wait_for_selector("//span[contains(text(), 'Cancel')]", :xpath)
    update_field('#task-label-input',new_data_field_name)
    wait_for_selector('.create-task__dialog-submit-button').click
    wait_for_selector("#confirm-dialog__checkbox").click
    wait_for_selector("#confirm-dialog__confirm-action-button").click
    wait_for_selector_none("#confirm-dialog__checkbox")
  end

  def delete_team_data_field
    wait_for_selector(".team-tasks__menu-item-button").click
    wait_for_selector(".team-tasks__edit-button")
    wait_for_selector('.team-tasks__delete-button').click
    wait_for_selector("//span[contains(text(), 'Cancel')]", :xpath)
    wait_for_selector("#confirm-dialog__checkbox").click
    wait_for_selector("#confirm-dialog__confirm-action-button").click
    wait_for_selector_none("//span[contains(text(), 'Cancel')]", :xpath)
  end

  def create_project(project_name)
    wait_for_selector(".team")
    name = project_name || "Project #{Time.now.to_i}"
    wait_for_selector('.create-project-card input[name="title"]').send_keys(name)
    wait_for_selector('.create-project-card button[type="submit"]').click
    wait_for_selector('.project')
  end

  def select_team(options)
    wait_for_selector("#teams-tab").click
    wait_for_selector("//*[contains(text(), '#{options[:name]}')]", :xpath).click
    wait_for_selector('.projects__list a[href$="/all-items"]')
    wait_for_selector(".project__title")
    wait_for_selector(".team-header__drawer-team-link").click
    wait_for_selector(".team__primary-info")
    wait_for_selector('.team')
  end

  def ask_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + "/"+subdomain+"/join"
    wait_for_selector(".join-team__button").click
    wait_for_selector(".message")
  end

  def approve_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + '/'+subdomain
    wait_for_selector('button.team-member-requests__user-button--approve').click
    wait_for_selector_none(".team-member-requests__user-button--deny")
  end

  def disapprove_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + '/'+subdomain
    wait_for_selector('button.team-member-requests__user-button--deny').click
    wait_for_selector_none('.team-member-requests__user-button--approve')
  end

  def change_the_member_role_to(rule_class)
    wait_for_selector('.team-members__edit-button', :css).click
    wait_for_selector('.role-select', :css, 29, index: 1).click
    wait_for_selector(rule_class).click
    wait_for_selector('#confirm-dialog__checkbox').click
    wait_for_selector('#confirm-dialog__confirm-action-button').click
    wait_for_selector('.team-members__edit-button', :css).click
  end

  def add_tag(tag_name)
    wait_for_selector(".tag-menu__icon").click
    fill_field('#tag-input__tag-input', tag_name)
    @driver.action.send_keys(:enter).perform
    wait_for_selector(".tag-menu__done").click
    wait_for_selector_none("#tag-input__tag-input")
  end

  def delete_tag(tag_name)
    wait_for_selector(".tag-menu__icon").click
    wait_for_selector("#tag-input__tag-input")
    wait_for_selector("input[type=checkbox]").click
    wait_for_selector(".tag-menu__done").click
  end
end
