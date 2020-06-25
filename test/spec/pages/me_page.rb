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
    wait_for_selector('.projects__list a[href$="/all-items"]')
    wait_for_selector(".project__title")
    wait_for_selector(".team-header__drawer-team-link").click
    wait_for_selector(".team__primary-info")
    wait_for_selector('.team')
    TeamPage.new(config: @config, driver: @driver)
  end

  def ask_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + "/"+subdomain+"/join"
    wait_for_selector(".join-team__button").click
    wait_for_selector(".message")
  end

  def approve_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + '/'+subdomain
    wait_for_selector('button.team-member-requests__user-button--approve').click
    wait_for_selector_none(".team-member-requests__user-button--deny")
  end

  def disapprove_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to @config['self_url'] + '/'+subdomain
    wait_for_selector('button.team-member-requests__user-button--deny').click
    wait_for_selector_none('.team-member-requests__user-button--approve')
  end
end
