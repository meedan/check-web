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
    wait_for_selector("create-media-submit", :id)
    fill_input('#create-media-input', options[:input])
    press(:enter)
    sleep 10
    wait_for_selector('.media-detail__check-timestamp').click
    wait_for_selector('.media')
    MediaPage.new(config: @config, driver: @driver)
  end

  def create_image_media(file)
    sleep 5
    @driver.find_element(:css, '#create-media__image').click
    fill_input('input[type=file]', file, { hidden: true })
    sleep 3
    @driver.find_element(:css, '#create-media-submit').click
    sleep 10
    wait_for_selector('.media-detail__check-timestamp').click
    wait_for_selector('.image-media-card')
    MediaPage.new(config: @config, driver: @driver)
  end

  def click_media
    click('.media-detail .media-detail__check-timestamp')

    wait_for_element('.media')
    MediaPage.new(config: @config, driver: @driver)
  end

  def edit(options)
    element = wait_for_selector('.project-menu', :css, 60)
    element.click
    sleep 1
    element = wait_for_selector('.project-edit__title-field input')
    element.clear
    fill_input('.project-edit__title-field input', options[:title])
    sleep 1 #(time for insert info in other field)
    element = wait_for_selector('.project-edit__description-field textarea:last-child')
    element.clear
    fill_input('.project-edit__description-field textarea:last-child', options[:description])
    sleep 1 #(time for click button
    element = wait_for_selector('.project-edit__editing-button--save button span')
    element.click
    @wait.until { @driver.page_source.include?(options[:title]) }
    self
  end

  def click_team_link
    sleep 5
    wait_for_element('.header-actions__drawer-toggle').click
    sleep 3
    wait_for_element('.team-header__drawer-team-link').click
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
