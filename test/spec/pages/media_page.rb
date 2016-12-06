require_relative './page.rb'
require_relative './logged_in_page.rb'

class MediaPage < Page
  include LoggedInPage

  def status_label
    element('.media-status__label').text
  end

  def tags
    @driver.find_elements(:css, '.media-tags__tag').map(&:text)
  end

  def add_tag(string)
    element('.media-actions').click
    element('.media-actions__menu-item').click
    fill_input('.ReactTags__tagInput input', string)
    press(:enter)
  end

  def has_tag?(tag)
    tags.include?(tag)
  end

  def add_annotation(string)
    fill_input('#cmd-input', string)
    press(:enter)
  end
end

