require_relative './page.rb'
require_relative './logged_in_page.rb'
require_relative './team_page.rb'

class TeamsPage < Page
  include LoggedInPage

  def url
    @config['self_url'] + "/check/teams"
  end

  def select_team(options)
    team = @wait.until { @driver.find_element(:xpath, "//*[contains(text(), '#{options[:name]}')]") }
    team.click
    wait_for_element('.team')
    TeamPage.new(config: @config, driver: @driver)
  end

  def ask_join_team(options = {})
    subdomain = options[:subdomain]
		p @config['self_url'] + "/"+subdomain+"/join" 
    @driver.navigate.to @config['self_url'] + "/"+subdomain+"/join"
    sleep 2 # TODO: better soft keyboard strategies
		click_button('.join-team__button')
    sleep 2 # TODO: better soft keyboard strategies
  end

  def approve_join_team(options = {})
    subdomain = options[:subdomain] 
		p @config['self_url'] + '/'+subdomain+'/members'
    @driver.navigate.to @config['self_url'] + '/'+subdomain+'/members'
    sleep 2 # TODO: better soft keyboard strategies
		click_button('.team-member-requests__user-button--approve')
    sleep 2 # TODO: better soft keyboard strategies
  end

end
