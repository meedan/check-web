require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './project_page.rb'

class TeamPage < Page
  include LoggedInPage

  def team_name
    wait_for_selector('.team__name').text
  end

  def project_titles
    elements('.team__project-title').map(&:text)
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
    wait_for_selector(".team")
    name = options[:name] || "Project #{Time.now.to_i}"
    wait_for_selector('.create-project-card input[name="title"]').send_keys(name)
    wait_for_selector('.create-project-card button[type="submit"]').click
    wait_for_selector('.project')
    ProjectPage.new(config: @config, driver: @driver)
  end
end
