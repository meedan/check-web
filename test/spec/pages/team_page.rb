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

  def create_project(options = {})
    name = options[:name] || "Project #{Time.now.to_i}"

    element('#create-project-title').click
    fill_input('#create-project-title', name)
    element('#create-project-title').submit

    wait_for_element('.project')
    ProjectPage.new(config: @config, driver: @driver)
  end
end
