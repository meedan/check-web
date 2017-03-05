require_relative './page.rb'
require_relative './logged_in_page.rb'

class SourcePage < Page
  include LoggedInPage

  def initialize(options)
    @id = options[:id]
    super(options)
  end

  def url
    @config['self_url'] + "/check/source/#{@id}"
  end

  def title
    element('h2.source-name').text
  end

  def avatar
    element('.source-avatar')
  end
end
