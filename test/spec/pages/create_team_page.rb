require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './team_page.rb'

class CreateTeamPage < Page
  include LoggedInPage

  def url
    @config['self_url'] + "/check/teams/new"
  end

  def create_team(options = {})
    name = options[:name] || "Team #{Time.now}"
    slug = options[:slug] || "team#{Time.now.to_i}#{Process.pid}"
    element('.create-team__team-display-name-input').click
    fill_input('.create-team__team-display-name-input', name)
    sleep 1 # TODO: better soft keyboard strategies
    element('.create-team__team-slug-input').click
    sleep 11 # TODO: better soft keyboard strategies
    element('.create-team__team-slug-input').clear
    sleep 11 # TODO: better soft keyboard strategies
    fill_input('.create-team__team-slug-input', slug)
    sleep 11
    click_button('.create-team__submit-button')
    wait_for_element('.team')
    TeamPage.new(config: @config, driver: @driver)
  end
end
