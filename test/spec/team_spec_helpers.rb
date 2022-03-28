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
    team = params[:team] || "team#{Time.now.to_i}"
    create_team_and_go_to_settings_page(team)
    wait_for_selector('.team-settings__integrations-tab').click
    wait_for_selector(params[:bot]).click
    wait_for_selector('.team-settings__similarity-tab')
  end

  def create_team_project_and_image_and_redirect_to_media_page
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('#create-media__add-item').click
    wait_for_selector('#create-media__image').click
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'files/test.png'))
    wait_for_selector_none('.without-file')
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector('.medias__item')
    wait_for_selector('.media__heading a').click
    wait_for_selector('.media__annotations-column')
  end

  def select_team(options)
    wait_for_selector('#teams-tab').click
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
    wait_for_selector("//span[contains(text(), 'Are you sure you want to change')]", :xpath)
    wait_for_selector('.confirm-proceed-dialog__proceed').click
    wait_for_selector_none('#confirm-dialog__confirm-action-button')
  end

  def change_folder_access
    wait_for_selector('.project__title-text')
    wait_for_selector('button.project-actions').click
    wait_for_selector("//span[contains(text(), 'Change access')]", :xpath).click
    wait_for_selector('.MuiSelect-icon')
    wait_for_selector('.MuiSelect-selectMenu').click
    @driver.action.send_keys(:arrow_down).perform
    @driver.action.send_keys(:enter).perform
    wait_for_selector('#confirm-dialog__confirm-action-button').click
  end
end
