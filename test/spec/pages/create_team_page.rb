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
    element('#team-name-container').click
    fill_input('#team-name-container', name)
    sleep 1 # TODO: better soft keyboard strategies
    element('#team-slug-container').click
    sleep 1 # TODO: better soft keyboard strategies
    element('#team-slug-container').clear
    sleep 1 # TODO: better soft keyboard strategies
    fill_input('#team-slug-container', slug)
    sleep 1
    click_button('.create-team__submit-button > button')
    wait_for_selector('.team',:css,60)
    TeamPage.new(config: @config, driver: @driver)
  end
end
