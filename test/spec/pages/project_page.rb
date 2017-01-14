require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './media_page.rb'

class ProjectPage < Page
  include LoggedInPage

  def project_name
    element('.project-header__project-name').text
  end

  def create_media(options = {})
    fill_input('#create-media-input', options[:input])
    press(:enter)

    wait_for_element('.media', { timeout: 15 })
    MediaPage.new(config: @config, driver: @driver)
  end

  def create_image_media(file)
    @driver.find_element(:css, '#create-media__switcher').click
    fill_input('input[type=file]', file, { hidden: true })
    sleep 3
    @driver.find_element(:css, '#create-media-submit').click
    wait_for_element('.image-media-card')
    MediaPage.new(config: @config, driver: @driver)
  end

  def click_media
    click('.media-detail__check-timestamp')

    wait_for_element('.media')
    MediaPage.new(config: @config, driver: @driver)
  end
end
