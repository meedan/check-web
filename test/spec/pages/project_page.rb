require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './media_page.rb'

class ProjectPage < Page
  include LoggedInPage

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
end
