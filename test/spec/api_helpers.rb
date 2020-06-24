module ApiHelpers
  def confirm_email(email)
    request_api('confirm_user', { email: email })
  end

  def api_path
    @config['api_path'] + '/test/'
  end

  def request_api(path, params)
    require 'net/http'
    uri = URI(api_path + path)
    uri.query = URI.encode_www_form(params)
    response = Net::HTTP.get_response(uri)
    ret = nil
    begin
      ret = OpenStruct.new JSON.parse(response.body)['data']
    rescue
      print "Failed to parse body of response for endpoint `#{path}`:\n#{response.inspect}\n" unless response.class <= Net::HTTPSuccess
    end
    ret
  end

  def api_create_and_confirm_user(params = {})
    email = params[:email] || "test-#{Time.now.to_i}-#{rand(1000)}@test.com"
    password = params[:password] || "12345678"
    user = request_api 'user', { name: 'User With Email', email: email, password: password, password_confirmation: password, provider: '' }
    request_api 'confirm_user', { email: email }
    user
  end

  def api_register_and_login_with_email(params = {})
    user = api_create_and_confirm_user(params)
    @driver.navigate.to "#{api_path}session?email=#{user.email}"
    user
  end

  def api_create_team(params = {})
    team_name = params[:team] || "TestTeam#{Time.now.to_i}-#{rand(99999)}"
    user = params[:user] || api_register_and_login_with_email
    options = { name: team_name, email: user.email }
    options[:private] = true if params[:private]
    team = request_api 'team', options
    team
  end

  def api_create_team_and_project(params = {})
    user = params[:user] || api_register_and_login_with_email
    team = request_api 'team', { name: "Test Team #{Time.now.to_i}", slug: "test-team-#{Time.now.to_i}-#{rand(1000).to_i}", email: user.email }
    team_id = team.dbid
    project = request_api 'project', { title: "Test Project #{Time.now.to_i}", team_id: team_id }
    { project: project, user: user, team: team }
  end

  def api_create_team_project_and_claim(quit = false, quote = 'Claim', project_id = 0)
    data = api_create_team_and_project
    if project_id == 0
      project_id = data[:project].dbid
    end
    claim = request_api 'claim', { quote: quote, email: data[:user].email, team_id: data[:team].dbid, project_id: project_id }
    if project_id
      claim.full_url = "#{@config['self_url']}/#{data[:team].slug}/project/#{project_id}/media/#{claim.id}"
    end
    @driver.quit if quit
    claim
  end

  # O
  def api_create_team_project_claims_sources_and_redirect_to_project_page(count, project_id = 0)
    data = api_create_team_and_project
    project_id_was = project_id
    if project_id == 0
      project_id = data[:project].dbid
    end
    count.times do |i|
      request_api 'claim', { quote: "Claim #{i}", email: data[:user].email, team_id: data[:team].dbid, project_id: project_id }
      request_api 'source', { url: '', name: "Source #{i}", email: data[:user].email, team_id: data[:team].dbid, project_id: data[:project].dbid }
      sleep 1
    end
    if project_id_was == 0
      return ProjectPage.new(config: @config, driver: @driver)
    else
      @driver.navigate.to @config['self_url'] + '/' + data[:team].slug + '/all-items'
      return nil
    end
  end

  def api_create_team_project_and_link(url = @media_url, project_id = 0)
    data = api_create_team_and_project
    if project_id == 0
      project_id = data[:project].dbid
    end
    link = request_api 'link', { url: url, email: data[:user].email, team_id: data[:team].dbid, project_id: project_id }
    if project_id
      link.full_url = "#{@config['self_url']}/#{data[:team].slug}/project/#{project_id}/media/#{link.id}"
    end
    link
  end

  # Create things, then navigate to /my-team/project/123/media/234?listIndex=0
  #
  # listIndex is always 0, so this only simulates user behavior when there are
  # no other media in this project.
  def api_create_team_project_and_link_and_redirect_to_media_page(url = @media_url, project_id = 0)
    media = api_create_team_project_and_link url, project_id
    @driver.navigate.to "#{media.full_url}?listIndex=0"
    sleep 2
    MediaPage.new(config: @config, driver: @driver)
  end

  # Create things, then navigate to /my-team/project/123/media/234?listIndex=0
  #
  # listIndex is always 0, so this only simulates user behavior when there are
  # no other media in this project.
  def api_create_team_project_and_claim_and_redirect_to_media_page(quote = 'Claim', project_id = 0)
    media = api_create_team_project_and_claim false, quote, project_id
    @driver.navigate.to "#{media.full_url}?listIndex=0"
    sleep 2
    MediaPage.new(config: @config, driver: @driver)
  end

  def api_create_media_and_go_to_search_page
    media = api_create_team_project_and_link
    @driver.navigate.to media.full_url
    sleep 10
    @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items'
    wait_for_selector(".search__results")
  end

  def api_create_claim_and_go_to_search_page
    media = api_create_team_project_and_claim(false, 'My search result')
    @driver.navigate.to media.full_url

    sleep 10 # wait for Sidekiq

    @driver.navigate.to @config['self_url'] + '/' + get_team + '/all-items'

    sleep 20

    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  def api_create_team_project_and_source(name, url)
    data = api_create_team_and_project
    request_api 'source', { url: url, name: name, email: data[:user].email, team_id: data[:team].dbid, project_id: data[:project].dbid }
  end

  def api_create_team_project_and_source_and_redirect_to_source(name, url)
    source = api_create_team_project_and_source(name, url)
    @driver.navigate.to source.full_url
    sleep 2
    source
  end

  def api_logout
    require 'net/http'
    uri = URI(api_path.gsub('/test/', '/api/users/logout'))
    Net::HTTP.get_response(uri)
  end

  def api_create_team_project_and_two_users
    ret = request_api 'create_team_project_and_two_users', {}
    ret
  end

  def api_create_media(params = {})
    data = params[:data] || api_create_team_and_project
    url = params[:url] || @media_url
    media = request_api 'link', { url: url, email: data[:user].email, team_id: data[:team].dbid, project_id: data[:project].dbid }
    media
  end

  def api_create_project(team_id)
    project = request_api 'project', { title: "TestProject#{Time.now.to_i}-#{rand(1000).to_i}", team_id: team_id }
  end

  def api_create_bot
    request_api 'bot', {}
  end
end
