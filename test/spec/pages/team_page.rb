require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './project_page.rb'

class TeamPage < Page
  include LoggedInPage

  def team_name
    element('.team__name').text
  end

  def project_titles
    elements('.team__project').map(&:text)
  end

  def fill_field(selector, value, type = :css, visible = true)
    wait = Selenium::WebDriver::Wait.new(timeout: 50)
    input = wait.until {
      element = @driver.find_element(type, selector)
      if visible
        element if element.displayed?
      else
        element
      end
    }
    sleep 1
    input.send_keys(value)
  end

  def create_project(options = {})
    sleep 10
    name = options[:name] || "Project #{Time.now.to_i}"
    fill_field('#create-project-title', name)
    sleep 1
    element('#create-project-submit-button').click
    sleep 5
    element('.project')
    ProjectPage.new(config: @config, driver: @driver)
  end
end
