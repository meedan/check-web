import React from 'react';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import { FeedCollaboration } from './FeedCollaboration';

const feed = {
  dbid: 1,
  feed_teams: {
    edges: [
      { node: { team: { name: 'Test team', dbid: 123, } } },
      { node: { team: { name: 'Other team', dbid: 234 } } },
    ],
  },
  feed_invitations: {
    edges: [
      { node: { email: 'foo@bar.com' } },
      { node: { email: 'baz@zaz.com' } },
    ],
  },
  team: { dbid: 123 },
};

describe('<FeedCollaboration />', () => {
  it('should display a row for each feed member', () => {
    let wrapper = shallowWithIntl(<FeedCollaboration feed={feed} onChange={() => {}} />);
    expect(wrapper.find('.feed-collab-row__member').length).toEqual(2);
  });

  it('should label feed organizer', () => {
    let wrapper = shallowWithIntl(<FeedCollaboration feed={feed} onChange={() => {}} />);
    expect(wrapper.find('.feed-collab-row__member').at(0).html()).toMatch('organizer');
  });

  it('should display a row for each invited team', () => {
    let wrapper = shallowWithIntl(<FeedCollaboration feed={feed} onChange={() => {}} />);
    expect(wrapper.find('.feed-collab-row__invitation-sent').length).toEqual(2);
  });

  it('should display text for new feed', () => {
    let wrapper = shallowWithIntl(<FeedCollaboration feed={{}} onChange={() => {}} />);
    expect(wrapper.html()).toMatch('Invite other organizations to contribute data into');
  });

  it('should NOT display text for existing feed', () => {
    let wrapper = shallowWithIntl(<FeedCollaboration feed={feed} onChange={() => {}} />);
    expect(wrapper.html()).not.toMatch('Invite other organizations to contribute data into');
  });

  it('should invite emails', () => {
    let wrapper = shallowWithIntl(<FeedCollaboration feed={feed} onChange={() => {}} />);
    let input = wrapper.find('.int-feed-collab__text-field');
    input.simulate('change', { target: { value: 'bar@foo.com' } });
    wrapper.find('.int-feed-collab__add-button').simulate('click');
    expect(wrapper.find('.feed-collab-row__invitation-new').length).toEqual(1);
    expect(wrapper.find('.feed-collab-row__invitation-new').html()).toMatch('bar@foo.com');
  });
});
