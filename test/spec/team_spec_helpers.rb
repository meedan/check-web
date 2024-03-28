module TeamSpecHelpers
  def create_team
    unless @driver.find_elements(:css, '.create-team').empty?
      unless @driver.find_elements(:css, '.find-team-card').empty?
        el = wait_for_selector('.find-team__toggle-create')
        el.click
      end
      fill_field('#team-name-container', "Team #{Time.now}")
      fill_field('#team-slug-container', "team#{Time.now.to_i}#{Process.pid}")
      press_button('.create-team__submit-button')
      sleep 0.5
    end
    @driver.navigate.to @config['self_url']
    sleep 0.5
  end

  def get_team
    @driver.execute_script('var context = Check.store.getState().app.context; return context.team ? context.team.slug : context.currentUser.current_team.slug').to_s
  end

  def create_team_and_go_to_settings_page(team)
    api_create_team(team: team)
    @driver.navigate.to "#{@config['self_url']}/#{team}/settings"
    wait_for_selector('.team-settings__tags-tab')
  end

  def create_team_and_install_bot(params = {})
    team = params[:team] || "team#{Time.now.to_i}-#{rand(99_999)}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__integrations-tab').click
    wait_for_selector(params[:bot]).click
    wait_for_selector('.team-settings__similarity-tab')
  end

  def select_team(options)
    wait_for_selector('.user-settings__workspaces-tab').click
    wait_for_selector("//*[contains(text(), '#{options[:name]}')]", :xpath).click
    wait_for_selector('.projects-list__all-items')
    wait_for_selector('.project__title')
    wait_for_selector('.team-header__drawer-team-link').click
    wait_for_selector('.team')
  end

  def approve_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to "#{@config['self_url']}/#{subdomain}"
    wait_for_selector('button.team-member-requests__user-button--approve').click
    wait_for_selector_none('.team-member-requests__user-button--deny')
  end

  def disapprove_join_team(options = {})
    subdomain = options[:subdomain]
    @driver.navigate.to "#{@config['self_url']}/#{subdomain}"
    wait_for_selector('button.team-member-requests__user-button--deny').click
    wait_for_selector_none('.team-member-requests__user-button--approve')
  end

  def change_the_member_role_to(rule_class)
    wait_for_selector('#mui-component-select-role-select', :css, 29, index: 1).click
    wait_for_selector('ul[role=listbox]')
    wait_for_selector(rule_class).click
    wait_for_selector("//p[contains(text(), 'Are you sure you want to change')]", :xpath)
    wait_for_selector('.int-confirm-proceed-dialog__proceed').click
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
  end
end
