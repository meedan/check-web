require_relative './page.rb'
require_relative './logged_in_page.rb'

class SourcePage < Page
  include LoggedInPage

  def initialize(options)
    @id = options[:id]
    super(options)
  end

  def url
    @config['self_url'] + "/source/#{@id}" # TODO: support subdomains
  end

  def title
    element('h2.source-name').text
  end
end
