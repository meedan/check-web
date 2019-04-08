require_relative 'spec_helper.rb'

shared_examples 'custom' do
  it "should register and redirect to newly created image media" do
    page = LoginPage.new(config: @config, driver: @driver).load
        .login_with_email(email: @email, password: @password)
        .create_image_media(File.expand_path('test.png', File.dirname(__FILE__)))

    expect(page.contains_string?('Added')).to be(true)
    expect(page.contains_string?('User With Email')).to be(true)
    expect(page.status_label == 'PENDING').to be(true)

    $media_id = page.driver.current_url.to_s.match(/\/media\/([0-9]+)$/)[1]
    expect($media_id.nil?).to be(false)
  end

  it "should change a media status via the dropdown menu" do
    media_pg = LoginPage.new(config: @config, driver: @driver).load
        .register_and_login_with_email(email: 'sysops+' + Time.now.to_i.to_s + '@meedan.com', password: @password)
        .create_team
        .create_project
        .create_media(input: "This is true")
    expect(media_pg.status_label).to eq('PENDING')

    media_pg.change_status('translated')
    expect(media_pg.status_label).to eq('TRANSLATED')
  end

  it "should find medias when searching by status", bin2: true do
    api_create_media_and_go_to_search_page
    sleep 3 #wait for ES to settle
    wait_for_selector("//h3[contains(text(), '1 result')]",:xpath)
    old = wait_for_selector_list("medias__item", :class).length
    wait_for_selector("search__open-dialog-button", :id).click
    wait_for_selector("//div[contains(text(), 'Translated')]",:xpath).click
    wait_for_selector("search-query__submit-button", :id).click
    sleep 3 #due the reload
    wait_for_selector("//h3[contains(text(), 'No results')]",:xpath)
    current = wait_for_selector_list("medias__item", :class).length
    expect(old > current).to be(true)
    expect(current == 0).to be(true)
    old = wait_for_selector_list("medias__item", :class).length
    wait_for_selector("search__open-dialog-button", :id).click
    wait_for_selector("//div[contains(text(), 'Pending')]",:xpath).click
    wait_for_selector("search-query__submit-button", :id).click
    sleep 3 #due the reload
    wait_for_selector("//h3[contains(text(), '1 result')]",:xpath)
    wait_for_selector("search-input", :id)
    current = wait_for_selector_list("medias__item", :class).length
    expect(old < current).to be(true)
    expect(current == 1).to be(true)
  end

  it "should add and edit a translation" do
    media_pg = LoginPage.new(config: @config, driver: @driver).load
               .login_with_email(email: @email, password: @password)
               .create_media(input: 'This is a text in english')
    sleep 3

    # Add translation
    expect(@driver.page_source.include?('Add a translation')).to be(true)
    @driver.find_element(:css, '.Select').click
    @driver.action.send_keys(:enter).perform
    fill_field('textarea[name="translation"]', 'This is a translation')
    @driver.action.send_keys(:enter).perform
    sleep 3
    expect(@driver.page_source.include?('A translation has been added!')).to be(true)
    expect(@driver.page_source.include?('This is a translation')).to be(true)

    # Edit translation
    @driver.find_element(:css, '.task-actions__icon').click
    @driver.find_elements(:css, '.task-actions__edit').click
    fill_field('textarea[name="translation_text"]', 'This is a different translation')
    @driver.find_element(:css, '.task__submit').click
    sleep 3
    expect(@driver.page_source.include?('This is a different translation')).to be(true)
  end
end
