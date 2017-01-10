require_relative './page.rb'
require_relative './logged_in_page.rb'

class MediaPage < Page
  include LoggedInPage

  def change_status(status)
    element('.media-status__label').click
    element(".media-status__menu-item--#{status.to_s}").click
    wait_for_element(".media-status__current--#{status.to_s}")
  end

  def status_label
    element('.media-status__label').text
  end

  def editing_mode?
    contains_element?('.ReactTags__tags')
  end

  def edit
    element('.media-actions').click
    element('.media-actions__menu-item').click
    @wait.until { editing_mode? }
  end

  def tags
    list = []
    if editing_mode?
      list = elements('.ReactTags__tag')
    else
      list = elements('.media-tags__tag')
    end
    list.map(&:text).collect{ |t| t.gsub(/<[^>]+>|×/, '') }
  end

  def add_tag(string)
    edit unless editing_mode?
    fill_input('.ReactTags__tagInput input', string)
    press(:enter)

    @wait.until { has_tag?(string)}
  end

  def has_tag?(tag)
    tags.include?(tag)
  end

  def add_annotation(string)
    fill_input('#cmd-input', string)
    press(:enter)
  end
end

