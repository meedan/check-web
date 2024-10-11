module ApiHelpers
  def confirm_email(email)
    request_api('confirm_user', { email: email })
  end

  def api_path
    "#{@config['api_path']}/test/"
  end

  def request_api(path, params)
    require 'net/http'
    uri = URI(api_path + path)
    uri.query = URI.encode_www_form(params)
    ret = nil
    response = nil
    begin
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = (uri.scheme == 'https')
      http.open_timeout = 120 # Time to open the connection
      http.read_timeout = 120 # Time to wait for the response
      request = Net::HTTP::Get.new(uri.request_uri)
      response = http.request(request)
      ret = OpenStruct.new JSON.parse(response.body)['data']
      puts "Successful response when calling #{path} with params '#{params.inspect}': #{response.body}"
    rescue Net::ReadTimeout
      puts "Timeout when calling #{path} with params '#{params.inspect}'"
    rescue StandardError
      puts "Failed to parse body of response for endpoint #{path}: Response: #{response.inspect} Body: #{response.body}" unless response.class <= Net::HTTPSuccess
    end
    ret
  end

  def api_create_and_confirm_user(params = {})
    email = params[:email] || "test-#{Time.now.to_i}-#{rand(1000)}@test.com"
    password = params[:password] || 'checkTest@12'
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
    team_name = params[:team] || "TestTeam#{Time.now.to_i}-#{rand(99_999)}"
    user = params[:user] || api_register_and_login_with_email
    options = { name: team_name, email: user.email }
    options[:private] = true if params[:private]
    request_api 'team', options
  end

  def api_create_team_and_bot(params = {})
    user = params[:user] || api_register_and_login_with_email
    @slug = "test-team-#{Time.now.to_i}-#{rand(10_000).to_i}"
    team = request_api 'team', { name: "Test Team #{Time.now.to_i}", slug: @slug, email: user.email }
    sleep 5
    puts "team created: #{team.inspect}"
    api_install_bot(params[:bot], team[:slug], params[:score]) if params[:bot]
    sleep 10
    { user: user, team: team }
  end

  def api_create_team_and_claim(params = {})
    quit = params[:quit] || false
    quote = params[:quote] || 'Claim'
    data = api_create_team_and_bot(params)
    claim = request_api 'claim', { quote: quote, email: data[:user].email, team_id: data[:team].dbid }
    claim.full_url = "#{@config['self_url']}/#{data[:team].slug}/media/#{claim.id}"
    @driver.quit if quit
    claim
  end

  def api_create_team_claims_sources_and_redirect_to_all_items(params = {})
    count = params[:count]
    data = api_create_team_and_bot(params)
    count.times do |i|
      request_api 'claim', { quote: "Claim #{i}", email: data[:user].email, team_id: data[:team].dbid }
      sleep 1
    end
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/all-items"
  end

  def api_create_team_and_bot_and_link(params = {})
    url = params[:url] || @media_url
    data = api_create_team_and_bot(params)
    link = request_api 'link', { url: url, email: data[:user].email, team_id: data[:team].dbid }
    link.full_url = "#{@config['self_url']}/#{data[:team].slug}/media/#{link.id}"
    link
  end

  # Create things, then navigate to /my-team/media/234?listIndex=0
  #
  # listIndex is always 0, so this only simulates user behavior when there are
  # no other media in this project.
  def api_create_team_and_bot_and_link_and_redirect_to_media_page(params = {})
    url = params[:url] || @media_url
    media = api_create_team_and_bot_and_link({ url: url })
    @driver.navigate.to "#{media.full_url}?listIndex=0"
    sleep 2
  end

  # Create things, then navigate to /my-team/media/234?listIndex=0
  #
  # listIndex is always 0, so this only simulates user behavior when there are
  # no other media in this project.
  def api_create_team_and_claim_and_redirect_to_media_page(params = {})
    params.merge!({ quit: false })
    media = api_create_team_and_claim(params)
    @driver.navigate.to "#{media.full_url}?listIndex=0"
    sleep 2
  end

  def api_create_claim_and_go_to_search_page
    media = api_create_team_and_claim({ quit: false, quote: 'My search result' })
    @driver.navigate.to media.full_url

    sleep 3 # wait for Sidekiq

    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items"
  end

  def api_logout
    require 'net/http'
    uri = URI(api_path.gsub('/test/', '/api/users/logout'))
    Net::HTTP.get_response(uri)
  end

  def api_create_team_project_and_two_users
    request_api 'create_team_project_and_two_users', {}
  end

  def api_add_team_user(params = {})
    request_api 'add_team_user', { email: params[:email], slug: params[:slug], role: params[:role] }
  end

  def api_create_bot
    request_api 'bot', {}
  end

  def api_create_team_metadata_and_media(params = {})
    url = params[:url] || nil
    type = params[:type] || 'free_text'
    options = params[:options] || '[]'
    data = api_create_team_and_bot(params)
    request_api 'team_data_field', { team_id: data[:team].dbid, fieldset: 'metadata', type: type, options: options }
    request_api 'link', { url: url || @media_url, email: data[:user].email, team_id: data[:team].dbid }
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/all-items"
  end

  def api_create_team_metadata_and_claim(params = {})
    quote = params[:quote] || 'Claim'
    type = params[:type] || 'free_text'
    options = params[:options] || '[]'
    data = api_create_team_and_bot(params)
    request_api 'team_data_field', { team_id: data[:team].dbid, fieldset: 'metadata', type: type, options: options }
    request_api 'claim', { quote: quote, email: data[:user].email, team_id: data[:team].dbid }
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/all-items"
  end

  def api_create_claim(params = {})
    data = params[:data] || api_create_team_and_bot(params)
    quote = params[:quote] || 'Claim'
    request_api 'claim', { quote: quote, email: data[:user].email, team_id: data[:team].dbid }
  end

  def api_suggest_similarity_between_items(team_id, source, target)
    request_api 'suggest_similarity', { pm1: source, pm2: target, team_id: team_id }
    @driver.navigate.to @config['self_url']
  end

  def api_install_bot(bot, slug = nil, settings = {})
    settings ||= { min_es_score: 0 }
    url = @driver.current_url.to_s
    team_slug = slug || url.match(%r{^https?://[^/]+/([^/]+)})[1]
    puts "Installing bot with settings: #{settings.inspect}"
    request_api 'install_bot', { bot: bot, slug: team_slug, settings: settings.to_json }
    sleep 2
    @driver.navigate.to url
  end

  def api_change_media_status(pm_id = nil, status = 'false')
    url = @driver.current_url.to_s
    pm_id ||= url.match(%r{media/(\d+)})[1]
    request_api 'media_status', { pm_id: pm_id, status: status }
    sleep 5
  end

  def api_create_team_claim_and_media_tag(params = {})
    data = params[:data] || api_create_team_and_bot(params)
    quote = params[:quote] || 'Claim'
    claim = request_api 'claim', { quote: quote, email: data[:user].email, team_id: data[:team].dbid }
    request_api 'new_media_tag', { pm_id: claim[:id], email: data[:user].email, tag: 'TAG' }
    @driver.navigate.to "#{@config['self_url']}/#{data[:team].slug}/all-items"
  end
end
