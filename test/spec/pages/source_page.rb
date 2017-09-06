require_relative './page.rb'
require_relative './logged_in_page.rb'

class SourcePage < Page
  include LoggedInPage

  def initialize(options)
    @id = options[:id]
    super(options)
  end

  def url
    @config['self_url'] + "/check/user/#{@id}"
  end

  def title
    element('.source__name').text
  end

  def avatar
    element('.source__avatar')
  end

  def delete_annotation
    # TODO: specify particular annotation
    element('.annotation .menu-button').click
    element('.annotation__delete').click
  end

end
