shared_examples 'report' do
  {
    'YouTube' => 'https://www.youtube.com/watch?v=ykLgjhBnik0',
    'Facebook' => 'https://www.facebook.com/FirstDraftNews/posts/1808121032783161',
    'Twitter' => 'https://twitter.com/TheWho/status/890135323216367616',
    'Instagram' => 'https://www.instagram.com/p/BRYob0dA1SC/'
  }.each do |provider, url|
    it "should generate a report from #{provider} video", bin1: true do
      api_create_team_project_and_link_and_redirect_to_media_page({ url: url })
      api_install_bot 'smooch'
      wait_for_selector('.media-detail')
      generate_a_report_and_copy_report_code
      @driver.navigate.to 'https://paste.pleaseignore.com/'
      wait_for_selector('.navbar-inner')
      wait_for_selector('#text').send_keys(' ')
      wait_for_selector('#text').send_keys(:control, 'v')
      wait_for_text_change(' ', '#text', :css)
      expect((@driver.find_element(:css, '#text').attribute('value') =~ /medias\.js/).nil?).to be(false)
    end
  end

  it 'should generate a report from website link copy the code and insert in a blog', bin3: true do
    api_create_team_project_and_link_and_redirect_to_media_page({ url: 'https://meedan.com' })
    api_install_bot 'smooch'
    wait_for_selector('.media-detail')
    generate_a_report_and_copy_report_code
    @driver.navigate.to 'http://codemagic.gr/'
    wait_for_selector('.ace_text-input').send_keys(' ')
    wait_for_selector('.ace_text-input').send_keys(:control, 'v')
    wait_for_text_change(' ', '.ace_text-input', :css)
    wait_for_selector('#update').click
    expect(@driver.page_source.include?('test-team')).to be(true)
  end

  it 'should create a image, change the status to in progress and generate a report', bin4: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('.project__description')
    create_image('files/test.png')
    wait_for_selector('.medias__item')
    wait_for_selector('.media__heading img')
    wait_for_selector('.media__heading a').click
    wait_for_selector('.card')
    api_install_bot 'smooch'
    expect(@driver.page_source.include?('In Progress')).to be(false)
    change_the_status_to('.media-status__menu-item--in-progress', false)
    expect(@driver.page_source.include?('In Progress')).to be(true)
    generate_a_report_and_copy_report_code
    expect(@driver.page_source.include?('In Progress')).to be(true)
    @driver.navigate.to 'https://paste.pleaseignore.com/'
    wait_for_selector('.navbar-inner')
    wait_for_selector('#text').send_keys(' ')
    wait_for_selector('#text').send_keys(:control, 'v')
    wait_for_text_change(' ', '#text', :css)
    expect((@driver.find_element(:css, '#text').attribute('value') =~ /medias\.js/).nil?).to be(false)
  end

  it 'should generate a report, copy the share url and open the report page in a incognito window', bin5: true do
    api_create_team_project_and_claim_and_redirect_to_media_page({ quote: 'Embed Test' })
    api_install_bot 'smooch'
    wait_for_selector('#media-detail__report-designer').click
    wait_for_selector('.report-designer__actions-copy')
    wait_for_selector("//span[contains(text(), 'Edit')]", :xpath).click
    wait_for_selector('#report-designer__text').send_keys('media text message')
    wait_for_selector("//span[contains(text(), 'Save')]", :xpath).click
    wait_for_selector("//span[contains(text(), 'Edit')]", :xpath)
    wait_for_selector('.report-designer__copy-share-url').click
    embed_url = wait_for_selector('.report-designer__copy-share-url input').property('value').to_s
    caps = Selenium::WebDriver::Remote::Capabilities.chrome('chromeOptions' => { 'args' => ['--incognito'] })
    driver = Selenium::WebDriver.for(:remote, url: @webdriver_url, desired_capabilities: caps)
    begin
      driver.navigate.to embed_url
      @wait.until { driver.find_element(:css, 'body') }
      expect(embed_url.match(/^http/).nil?).to be(false)
    ensure
      driver.quit
    end
  end

  it 'should set claim and fact check information for an item, generate a report and copy to report', bin2: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    api_install_bot 'smooch'
    wait_for_selector('.media-detail')

    # Claim
    expect(@driver.page_source.include?('My claim description')).to be(false)
    wait_for_selector('#media-fact-check__title')
    wait_for_selector('#media-claim__description').send_keys('My claim description')
    wait_for_text_change(' ', '#media-claim__description', :css)
    wait_for_selector('#media__fact-check').click

    # Fact-check
    expect(@driver.page_source.include?('My fact-check title')).to be(false)
    expect(@driver.page_source.include?('My fact-check summary')).to be(false)
    wait_for_selector('#media-fact-check__title').send_keys('My fact-check title')
    wait_for_selector('#media-fact-check__summary').send_keys('My fact-check summary')
    wait_for_text_change(' ', '#media-fact-check__summary', :css)
    wait_for_selector('#media__claim').click
    sleep 5

    # Make sure claim and fact-check were saved
    @driver.navigate.refresh
    wait_for_selector('#media__fact-check')
    expect(@driver.page_source.include?('My claim description')).to be(true)
    expect(@driver.page_source.include?('My fact-check title')).to be(true)
    expect(@driver.page_source.include?('My fact-check summary')).to be(true)

    # Copy to report
    wait_for_selector('.media-fact-check__copy-to-report').click
    wait_for_selector('.report-designer__copy-share-url')
    expect(@driver.page_source.include?('Design your report')).to be(true)
    expect(@driver.page_source.include?('My fact-check title')).to be(true)
    expect(@driver.page_source.include?('My fact-check summary')).to be(true)
  end
end
