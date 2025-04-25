import React from 'react';
import { OrgFilterButton } from './OrgFilterButton';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import TeamAvatar from '../team/TeamAvatar';


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
        current
        enabled
        savedSearch={savedSearch}
        team={team}
        onClick={onClickMock}
      />,
    );

    expect(wrapper.find('.feed-top-bar-item').exists()).toBe(true);
    expect(wrapper.text()).toContain('Test Saved Search');
    expect(wrapper.find('.int-feed-top-bar__icon-button--settings').exists()).toBe(true);
  });

  it('should display "no list selected" when there is no saved search', () => {
    const wrapper = mountWithIntl(
      <OrgFilterButton
        current
        enabled
        savedSearch={null}
        team={team}
        onClick={onClickMock}
      />,
    );

    expect(wrapper.text()).toContain('no list selected');
  });

  it('should render the avatar correctly', () => {
    const wrapper = mountWithIntl(
      <OrgFilterButton
        current
        enabled
        savedSearch={savedSearch}
        team={team}
        onClick={onClickMock}
      />,
    );

    expect(TeamAvatar).toHaveLength(1);
    expect(wrapper.find('.int-feed-top-bar__button--filter-org')).toHaveLength(1);
  });


  it('should not display the "go to custom list" button when savedSearch is null', () => {
    const wrapper = mountWithIntl(
      <OrgFilterButton
        current
        enabled
        savedSearch={null}
        team={team}
        onClick={onClickMock}
      />,
    );
    expect(wrapper.find('.int-feed-top-bar__icon-button--settings').exists()).toBe(false);
  });

  it('should not display the "go to custom list" button or saved search title when current is false', () => {
    const wrapper = mountWithIntl(
      <OrgFilterButton
        current={false}
        enabled
        savedSearch={savedSearch}
        team={team}
        onClick={onClickMock}
      />,
    );

    expect(wrapper.find('.int-feed-top-bar__icon-button--settings').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Test Saved Search');
  });
});
