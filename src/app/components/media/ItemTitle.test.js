import React from 'react';
import { ItemTitleComponent as ItemTitle } from './ItemTitle';
import { mountWithIntl, shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<ItemTitle />', () => {
  const projectMedia = {
    id: 'UHJvamVjdE1lZGlhLzEK',
    permissions: JSON.stringify({ 'update ProjectMedia': true }),
    archived: 0,
    title: 'Title',
    custom_title: 'Custom Title',
    media_slug: 'test-text-1',
    is_suggested: false,
    claim_description: {
      description: 'Claim Title',
      fact_check: {
        title: 'Fact-Check Title',
      },
    },
  };

  it('should have options', () => {
    const wrapper = shallowWithIntl(<ItemTitle projectMedia={{ ...projectMedia }} />);
    expect(wrapper.find('ItemTitleOption')).toHaveLength(4);
  });

  it('should not have a pinned media title option if item has no media', () => {
    const wrapper = shallowWithIntl(<ItemTitle projectMedia={{ ...projectMedia, media_slug: '' }} />);
    expect(wrapper.find('ItemTitleOption').at(1).render().text()).toMatch('Add a media to enable');
  });

  it('should not have a claim title option if item has no claim', () => {
    let wrapper = shallowWithIntl(<ItemTitle projectMedia={{ ...projectMedia, claim_description: null }} />);
    expect(wrapper.find('ItemTitleOption').at(2).render().text()).toMatch('Add a claim to enable');

    wrapper = shallowWithIntl(<ItemTitle projectMedia={{ ...projectMedia, claim_description: { description: '' } }} />);
    expect(wrapper.find('ItemTitleOption').at(2).render().text()).toMatch('Add a claim to enable');
  });

  it('should not have a fact-check title option if item has no fact-check', () => {
    let wrapper = shallowWithIntl(<ItemTitle projectMedia={{ ...projectMedia, claim_description: { description: 'Test', fact_check: null } }} />);
    expect(wrapper.find('ItemTitleOption').last().render().text()).toMatch('Add a fact-check to enable');

    wrapper = shallowWithIntl(<ItemTitle projectMedia={{ ...projectMedia, claim_description: { description: 'Test', fact_check: { title: '' } } }} />);
    expect(wrapper.find('ItemTitleOption').last().render().text()).toMatch('Add a fact-check to enable');
  });

  it('should have default title', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: null }} />);
    expect((wrapper.find('.int-item-title__textfield--title textarea').render().text())).toMatch('Claim Title');
  });

  it('should have custom title', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'custom_title' }} />);
    expect((wrapper.find('.int-item-title__textfield--title textarea').render().text())).toMatch('Custom Title');
  });

  it('should have pinned media ID title', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'pinned_media_id' }} />);
    expect((wrapper.find('.int-item-title__textfield--title textarea').render().text())).toMatch('test-text-1');
  });

  it('should have claim title', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'claim_title' }} />);
    expect((wrapper.find('.int-item-title__textfield--title textarea').render().text())).toMatch('Claim Title');
  });

  it('should have fact-check title', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'fact_check_title' }} />);
    expect((wrapper.find('.int-item-title__textfield--title textarea').render().text())).toMatch('Fact-Check Title');
  });

  it('should be disabled if title field is not custom title', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'fact_check_title' }} />);
    expect(wrapper.find('.int-item-title__textfield--title textarea').render().attr('disabled')).toBe('disabled');
  });

  it('should be disabled if title field is custom title but user has no permission', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'custom_title', permissions: JSON.stringify({ 'update ProjectMedia': false }) }} />);
    expect(wrapper.find('.int-item-title__textfield--title textarea').render().attr('disabled')).toBe('disabled');
  });

  it('should be disabled if title field is custom title but item is in the trash', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'custom_title', archived: 1 }} />);
    expect(wrapper.find('.int-item-title__textfield--title textarea').render().attr('disabled')).toBe('disabled');
  });

  it('should be disabled if title field is custom title but item is SPAM', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'custom_title', archived: 4 }} />);
    expect(wrapper.find('.int-item-title__textfield--title textarea').render().attr('disabled')).toBe('disabled');
  });

  it('should be disabled if title field is custom title but item is a suggestion', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'custom_title', is_suggested: true }} />);
    expect(wrapper.find('.int-item-title__textfield--title textarea').render().attr('disabled')).toBe('disabled');
  });

  it('should not be disabled if title field is custom title', () => {
    const wrapper = mountWithIntl(<ItemTitle projectMedia={{ ...projectMedia, title_field: 'custom_title' }} />);
    expect(wrapper.find('.int-item-title__textfield--title textarea').render().attr('disabled')).toBe(undefined);
  });
});
