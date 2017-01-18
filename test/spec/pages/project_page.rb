require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './media_page.rb'
require_relative './team_page.rb'

class ProjectPage < Page
  include LoggedInPage

  def project_title
    element('.project-header__title').text
  end

  def create_media(options = {})
    fill_input('#create-media-input', options[:input])
    press(:enter)

    wait_for_element('.media', { timeout: 15 })
    MediaPage.new(config: @config, driver: @driver)
  end

  def click_media
    click('.media-detail__check-timestamp')

    wait_for_element('.media')
    MediaPage.new(config: @config, driver: @driver)
  end

  def edit(options)
    element('.header-actions__menu-toggle').click
    element('.project-menu').click
    wait_for_element('.project-edit')

    element('.project-edit__title-field input').clear
    fill_input('.project-edit__title-field input', options[:title])
    element('.project-edit__description-field textarea:last-child').clear
    fill_input('.project-edit__description-field textarea:last-child', options[:description])
    element('.project-edit__editing-button--save').click

    wait_for_element('.project')
    self
  end

  def click_team_avatar
    element('.team-header__avatar').click

    wait_for_element('.team')
    TeamPage.new(config: @config, driver: @driver)
  end
end
