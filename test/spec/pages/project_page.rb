require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './media_page.rb'
require_relative './team_page.rb'

class ProjectPage < Page
  include LoggedInPage

  def url
    @config['self_url']
  end

  def project_title
    element('.project-header__title').text
  end

  def create_media(options = {})
    wait_for_selector(".project-actions")
    wait_for_selector("#create-media__add-item").click
    wait_for_selector("#create-media-submit")
    fill_input('#create-media-input', options[:input])
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector_none("#create-media-input")
    wait_for_selector(".medias__item")
    wait_for_selector(".media__heading").click
    wait_for_selector('.media')
    MediaPage.new(config: @config, driver: @driver)
  end

  def create_image_media(file)
    wait_for_selector(".project-actions")
    wait_for_selector("#create-media__add-item").click
    wait_for_selector('#create-media__image').click
    fill_input('input[type=file]', file, { hidden: true })
    wait_for_selector_none("#create-media-input")
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector_none('#create-media-dialog__submit-button')
    wait_for_selector(".medias__item")
    wait_for_selector(".media__heading").click
    wait_for_selector('.image-media-card')
    MediaPage.new(config: @config, driver: @driver)
  end

  def click_media
    wait_for_selector(".medias__item")
    wait_for_selector(".media__heading").click
    wait_for_element('.media')
    MediaPage.new(config: @config, driver: @driver)
  end

  def edit(options)
    wait_for_selector('.project-actions', :css, 60).click
    wait_for_selector('.project-actions__edit', :css, 60).click
    if (options[:title])
      #puts "options title"
      element = wait_for_selector('.project-edit__title-field input')
      element.clear
      fill_input('.project-edit__title-field input', options[:title])
    end
    sleep 1 #(time for insert info in other field)
    if (options[:description] != nil)
      element = wait_for_selector('.project-edit__description-field textarea:last-child')
      element.clear
      @driver.action.send_keys(" \b").perform
      sleep 1
      fill_input('.project-edit__description-field textarea:last-child', options[:description])
    end
    sleep 1 #(time for click button
    element = wait_for_selector('.project-edit__editing-button--save button span')
    element.click
    self
  end

  def click_team_link
    wait_for_selector('.team-header__drawer-team-link').click
    TeamPage.new(config: @config, driver: @driver)
  end

  def new_project(options = {})
    name = options[:name] || "Project #{Time.now.to_i}"
    element('.team__new-project-input').click
    element('.team__new-project-input').clear
    fill_input('.team__new-project-input', name)
    press(:enter)
  end
end
