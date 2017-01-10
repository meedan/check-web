require_relative './source_page.rb'

class MePage < SourcePage
  def url
    @config['self_url'] + '/me'
  end

  def source_id
    element('.source').attribute('data-id')
  end
end
