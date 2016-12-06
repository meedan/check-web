require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './team_page.rb'

class TeamsPage < Page
  include LoggedInPage

  def url
    @config['self_url'] + "/teams"
  end

  def select_team(options)
    team = @wait.until { @driver.find_element(:xpath, "//*[contains(text(), '#{options[:name]}')]") }
    team.click
    wait_for_element('.team')
    TeamPage.new(config: @config, driver: @driver)
  end
end
