require_relative './source_page.rb'

class MePage < SourcePage

  def url
    @config['self_url'] + '/check/me'
  end

  def source_id
    element('.source').attribute('data-id')
  end

  def select_team(options)
    wait_for_selector("#teams-tab").click
    team = wait_for_selector("//*[contains(text(), '#{options[:name]}')]", :xpath)
    team.click
    wait_for_element('.team')
    TeamPage.new(config: @config, driver: @driver)
  end

  def ask_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + "/"+subdomain+"/join"
    sleep 2 # TODO: better soft keyboard strategies
    click_button('.join-team__button button')
    sleep 2 # TODO: better soft keyboard strategies
  end

  def approve_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + '/'+subdomain
    sleep 2 # TODO: better soft keyboard strategies
    click_button('.team-member-requests__user-button--approve button')
    sleep 2 # TODO: better soft keyboard strategies
  end

  def disapprove_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + '/'+subdomain
    sleep 2 # TODO: better soft keyboard strategies
    click_button('.team-member-requests__user-button--deny button')
    sleep 2 # TODO: better soft keyboard strategies
  end
end
