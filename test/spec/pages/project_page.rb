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
    sleep 2
    fill_input('#create-media-input', options[:input])
    press(:enter)
#   wait_for_element('.medias-loading', { timeout: 30 })
    wait_for_element('.media', { timeout: 45 })
    MediaPage.new(config: @config, driver: @driver)
  end

  def create_image_media(file)
    sleep 5
    @driver.find_element(:css, '#create-media__image').click
    fill_input('input[type=file]', file, { hidden: true })
    sleep 3
    @driver.find_element(:css, '#create-media-submit').click
    wait_for_selector('.image-media-card')
    MediaPage.new(config: @config, driver: @driver)
  end

  def click_media
    click('.media-detail .media-detail__check-timestamp')

    wait_for_element('.media')
    MediaPage.new(config: @config, driver: @driver)
  end

  def edit(options)
    element('.header-actions__drawer-toggle').click
    element('.project-menu').click
    wait_for_element('.project-edit')
    element('body').click
    sleep 1
    element('.project-edit__title-field input').clear
    fill_input('.project-edit__title-field input', options[:title])
    element('.project-edit__description-field textarea:last-child').clear
    fill_input('.project-edit__description-field textarea:last-child', options[:description])
    element('.project-edit__editing-button--save button span').click

    wait_for_element('.project')
    sleep 2

    self
  end

  def click_team_link
    element('.header-actions__drawer-toggle').click
    wait_for_element('.team-header__drawer-team-link')
    element('.team-header__drawer-team-link').click
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
