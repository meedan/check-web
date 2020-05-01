require_relative './page.rb'
require_relative './logged_in_page.rb'

class MediaPage < Page
  include LoggedInPage

  def change_status(status)
    element('.media-status__label').click
    element(".media-status__menu-item--#{status.to_s}").click
    wait_for_selector(".media-status__current--#{status.to_s}")
  end

  def set_description(string)
    edit
    fill_input('#media-detail__description-input', string)
    click('.media-detail__save-edits') # Done
    wait_for_selector_none(".media-detail__save-edits")
    wait_for_selector("//span[contains(@class, 'Linkify') and contains(text(), '#{string}')]", :xpath)
  end

  def set_title(string)
    edit
    fill_input('#media-detail__title-input', string, {clear: true})
    click('.media-detail__save-edits') # Done
    @wait.until {
      string == primary_heading.text
    }
  end

  def status_label
    element('.media-status__label').text
  end

  def editing_mode?
    contains_element?('.media-detail__title-input')
  end

  def pender_visible?
    contains_element?('.pender-container')
  end

  def edit
    # For some reason this line fails if pender_visible? is false — CGB 2017-9-29
    # element('.media-detail').click unless pender_visible?
    element('.media-actions').click
    element('.media-actions__edit').click
    @wait.until { editing_mode? }
  end

  def tags
    list = []
    if editing_mode?
      list = elements('.source-tags__tag')
    else
      list = elements('.media-tags__tag')
    end
    list.map(&:text).collect{ |t| t.gsub(/<[^>]+>|×/, '') }
  end

  def add_tag(string)
    el = wait_for_selector("tag-menu__icon", :class)
    el.click
    fill_input('#tag-input__tag-input', string, { clear: true })
    press(:enter)
    @wait.until { has_tag?(string) }
    el = wait_for_selector("tag-menu__done", :class)
    el.click
  end

  def delete_tag(string)
    el = wait_for_selector("tag-menu__icon", :class)
    el.click
    fill_input('#tag-input__tag-input', string, { clear: true })
    el = wait_for_selector(string, :id)
    el.click
    el = wait_for_selector("tag-menu__done", :class)
    el.click
  end

  def has_tag?(tag)
    tags.include?(tag)
  end

  def add_annotation(string)
    fill_input('#cmd-input', string)
    press(:enter)
  end

  def delete_annotation
    element('.annotation .menu-button').click
    wait_for_selector('.annotation__delete')
    element('.annotation__delete').click
  end

  def primary_heading
    element('.media__heading')
  end

  def go_to_project
    click('.project-header__back-button')
    # or via menu:
    # click('.project-header__title')
    # click('.project-list__link--active')
    # click('.project-header__menu-toggle-label')

    @wait.until { element('.project') }
    return ProjectPage.new(config: @config, driver: @driver)
  end
end
