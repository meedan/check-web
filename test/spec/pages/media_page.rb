require_relative './page.rb'
require_relative './logged_in_page.rb'

class MediaPage < Page
  include LoggedInPage

  def tags
    @driver.find_elements(:css, '.media-tags__tag').map(&:text)
  end

  def has_tag?(tag)
    tags.include?(tag)
  end

  def add_annotation(string)
    fill_input('#cmd-input', string)
    press(:enter)
  end
end

