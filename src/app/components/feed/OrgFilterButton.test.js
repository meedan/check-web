import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import { OrgFilterButton } from './OrgFilterButton';

describe('<OrgFilterButton />', () => {
  const team = {
    avatar: 'avatar.png',
    dbid: 1,
    name: 'Test Team',
    slug: 'test-team',
  };

  const savedSearch = {
    dbid: 101,
    title: 'Test Saved Search',
  };

  const onClickMock = jest.fn();

  it('should display saved search title and "go to custom list" button when there is a saved search', () => {
    const wrapper = mountWithIntl(
      <OrgFilterButton
        team={team}
        savedSearch={savedSearch}
        current
        enabled
        onClick={onClickMock}
      />
    );

    expect(wrapper.find('.feed-top-bar-item').exists()).toBe(true);
    expect(wrapper.text()).toContain('Test Saved Search');
    const goToCustomListButton = wrapper.find('.int-feed-top-bar__icon-button--settings');
    expect(goToCustomListButton.exists()).toBe(true);
  });

  it('should displays "no list selected" when there is no saved search', () => {
    const wrapper = mountWithIntl(
      <OrgFilterButton
        team={team}
        savedSearch={null}
        current
        enabled
        onClick={onClickMock}
      />
    );

    expect(wrapper.text()).toContain('no list selected');
  });

});