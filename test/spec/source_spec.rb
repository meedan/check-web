require_relative 'spec_helper'

shared_examples 'source' do
  it 'should check, edit and remove source info', bin2: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://g1.globo.com/'
    wait_for_selector('.media')
    wait_for_selector('.tag-menu__icon')
    wait_for_selector('.media-tab__source').click
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    wait_for_selector('#media__source')
    expect(@driver.page_source.include?('G1')).to be(true)
    wait_for_selector('#source__name-input').send_keys('- Edited')
    @driver.action.send_keys(:enter).perform
    wait_for_text_change('G1', '.source__name', :css)
    wait_for_selector("//h1[contains(text(), 'G1- Edited')]", :xpath)
    expect(@driver.page_source.include?('G1- Edited')).to be(true)
    # check main link
    expect(wait_for_selector('#main_source__link').attribute('value') == 'https://g1.globo.com/').to be(true)
    expect(@driver.find_elements(:css, '.source__remove-link-button').length == 1).to be(true)
    # add a secondary link
    wait_for_selector('.source__add-link-button').click
    wait_for_selector('#source__link-input-new').send_keys('https://www.bbc.com/news/uk')
    @driver.action.send_keys(:enter).perform
    wait_for_selector_list_size('.source__remove-link-button', 2)
    # remove main link
    expect(@driver.find_elements(:css, '.source__remove-link-button').length == 2).to be(true)
    wait_for_selector_list('.source__remove-link-button')[0].click
    wait_for_selector_none('input[value="https://g1.globo.com/"]', :css, 30)
    # check that the main link was changed
    expect(wait_for_selector('#main_source__link').attribute('value') == 'https://www.bbc.com/news/uk').to be(true)
    expect(@driver.find_elements(:css, '.source__remove-link-button').length == 1).to be(true)
    wait_for_selector('.source__add-link-button').click
    # try add the same source again
    wait_for_selector('#source__link-input-new').send_keys('https://www.bbc.com/news/uk')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#source__link-input-new-helper-text')
    expect(@driver.page_source.include?('Account has already been taken')).to be(true)
  end

  it 'should add a existing source for a media', bin6: true do
    api_create_team_project_and_link_and_redirect_to_media_page 'https://www.cnnbrasil.com.br/'
    wait_for_selector('.media')
    wait_for_selector('.media-tab__source').click
    wait_for_selector('.source__name')
    expect(wait_for_selector('.source__name').text == 'CNN Brasil').to be(true)
    wait_for_selector('.project-header__back-button').click
    wait_for_selector('#search-input')
    wait_for_selector_list_size('.medias__item', 1)
    # create another media and add a existing source
    create_media('media 2')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media')
    wait_for_selector('.media-tab__source').click
    wait_for_selector('#media-source__create-button')
    wait_for_selector('input[name=source-name]').send_keys('CNN')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#main_source__link')
    expect(wait_for_selector('.source__name').text == 'CNN Brasil').to be(true)
  end

  it 'should add a new source for a media, answer and edit the source annotation', bin6: true do
    # Create team and go to team page that should not contain any task
    team = "task-team-#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__metadata-tab').click
    wait_for_selector("//span[contains(text(), 'metadata')]", :xpath)
    wait_for_selector('.metadata-tab__source').click
    # Create source annotation
    expect(@driver.page_source.include?('No metadata fields')).to be(true)
    expect(@driver.page_source.include?('my metadata')).to be(false)
    create_annotation(tab_class: '.metadata-tab__source', task_type_class: '.edit-task-dialog__menu-item-free_text', task_name: 'my source annotation')
    expect(@driver.page_source.include?('No metadata fields')).to be(false)
    expect(@driver.page_source.include?('my source annotation')).to be(true)
    # api_create_team_project_and_link 'https://www.cnnbrasil.com.br/'
    @driver.navigate.to "#{@config['self_url']}/#{team}/all-items"
    wait_for_selector('#search-input')
    create_media('https://www.cnnbrasil.com.br/')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media')
    @driver.manage.window.maximize
    # create source
    wait_for_selector('.media-tab__source').click
    expect(@driver.page_source.include?('BBC')).to be(false)
    wait_for_selector("//span[contains(text(), 'Create new')]", :xpath).click
    wait_for_selector('#source__name-input').send_keys('BBC')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#source_primary__link-input').send_keys('https://www.bbc.com/portuguese')
    wait_for_selector('.source__edit-save-button').click
    wait_for_selector_none('.source__edit-cancel-button')
    expect(wait_for_selector('.source__name').text == 'BBC').to be(true)
    expect(wait_for_selector('#main_source__link').attribute('value') == 'https://www.bbc.com/portuguese').to be(true)
    # answer annotation response
    wait_for_selector('.form-edit').click
    wait_for_selector('#metadata-input').send_keys('annotation response')
    wait_for_selector('.form-save').click
    wait_for_selector_none('.form-save')
    expect(@driver.page_source.include?('annotation response')).to be(true)
    # edit annotation response
    expect(@driver.page_source.include?('annotation response- edited')).to be(false)
    wait_for_selector('.form-edit').click
    wait_for_selector('#metadata-input').send_keys('- edited')
    wait_for_selector('.form-save').click
    wait_for_selector_none('.form-save')
    expect(@driver.page_source.include?('annotation response- edited')).to be(true)
  end
end
