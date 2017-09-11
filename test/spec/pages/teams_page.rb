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
    @driver.navigate.to @config['self_url'] + "/"+subdomain+"/join"
    sleep 2 
    click_button('.join-team__button button')
    sleep 2 
  end

  def approve_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + '/'+subdomain+'/members'
    sleep 2 
    click_button('.team-member-requests__user-button--approve button')
    sleep 2 
  end

  def disapprove_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + '/'+subdomain+'/members'
    sleep 2
    click_button('.team-member-requests__user-button--deny button')
    sleep 2
  end

  def delete_user_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + '/'+subdomain+'/members'
    click_button('.team-members__edit-button')
    sleep 1
    l = @driver.find_elements(:xpath => '//button')
    l[l.length-1].click
    sleep 1
  end

  def edit_user_role(options = {})
    click_button('.team-members__edit-button')
    list = @driver.find_elements(:class, "Select-arrow-zone")
    list[1].click
    sleep 2
    @driver.find_element(:id, "react-select-3--option-2").click
    click_button('.team-members__edit-button')
  end
end
