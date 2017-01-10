require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './team_page.rb'

class CreateTeamPage < Page
  include LoggedInPage

  def url
    @config['self_url'] + "/teams/new" # TODO: support subdomains
  end

  def create_team(options = {})
    name = options[:name] || "Team #{Time.now}"
    subdomain = options[:subdomain] || "team#{Time.now.to_i}#{Process.pid}"

    element('.create-team__team-display-name-input').click
    sleep 1 # TODO: better soft keyboard strategies
    fill_input('.create-team__team-display-name-input', name)

    element('.create-team__team-subdomain-input').click
    sleep 1 # TODO: better soft keyboard strategies
    fill_input('.create-team__team-subdomain-input', subdomain)

    click_button('.create-team__submit-button')

    wait_for_element('.team')
    TeamPage.new(config: @config, driver: @driver)
  end
end
