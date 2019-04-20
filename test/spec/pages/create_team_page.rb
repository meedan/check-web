require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './team_page.rb'

class CreateTeamPage < Page
  include LoggedInPage

  def url
    @config['self_url'] + "/check/teams/new"
  end

  def create_team(options = {})
    if @driver.find_elements(:css, '.find-team-card').size > 0
      el = wait_for_selector('.find-team__toggle-create')
      el.click
    end
    name = options[:name] || "Team #{Time.now}"
    slug = options[:slug] || "team#{Time.now.to_i}#{Process.pid}"
    fill_field('#team-name-container', name)
    input = element('#team-slug-container')
    input.click
    sleep 5
    input.clear
    fill_field('#team-slug-container', slug)
    sleep 1
    click_button('.create-team__submit-button > button')
    wait_for_selector('.team',:css,60)
    TeamPage.new(config: @config, driver: @driver)
  end
end
