import React from 'react';
import { FeedCollaboration } from './FeedCollaboration';
import { shallowWithIntl, mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const feed = {
  dbid: 1,
  feed_teams: {
    edges: [
      { node: { team: { name: 'Test team', dbid: 123 } } },
      { node: { team: { name: 'Other team', dbid: 234 } } },
    ],
  },
  feed_invitations: {
    edges: [
      { node: { email: 'foo@bar.com', state: 'invited' } },
      { node: { email: 'baz@zaz.com', state: 'invited' } },
    ],
  },
  team: { dbid: 123 },

};

// Mock the intl object to fix the warning about prop is required
const mockIntl = {
  formatMessage: jest.fn(),
  formatHTMLMessage: jest.fn(),
  formatDate: jest.fn(),
  formatTime: jest.fn(),
  formatRelative: jest.fn(),
  formatNumber: jest.fn(),
  formatPlural: jest.fn(),
  now: jest.fn(),
};

describe('<FeedCollaboration />', () => {
  it('should display a row for each feed member', () => {
    const wrapper = shallowWithIntl(<FeedCollaboration feed={feed} intl={mockIntl} onChange={() => {}} />);
    expect(wrapper.find('.feed-collab-row__member').length).toEqual(2);
  });

  it('should label feed organizer', () => {
    const wrapper = shallowWithIntl(<FeedCollaboration feed={feed} intl={mockIntl} onChange={() => {}} />);
    expect(wrapper.find('.feed-collab-row__member').at(0).html()).toMatch('organizer');
  });

  it('should display a row for each invited team', () => {
    const wrapper = shallowWithIntl(<FeedCollaboration feed={feed} intl={mockIntl} onChange={() => {}} />);
    expect(wrapper.find('.feed-collab-row__invitation-sent').length).toEqual(2);
  });

  it('should display text for new feed', () => {
    const wrapper = shallowWithIntl(<FeedCollaboration feed={{}} intl={mockIntl} onChange={() => {}} />);
    expect(wrapper.html()).toMatch('Invite other organizations to contribute data into');
  });

  it('should NOT display text for existing feed', () => {
    const wrapper = shallowWithIntl(<FeedCollaboration feed={feed} intl={mockIntl} onChange={() => {}} />);
    expect(wrapper.html()).not.toMatch('Invite other organizations to contribute data into');
  });

  it('should invite emails as feed creator', () => {
    const wrapper = shallowWithIntl(<FeedCollaboration collaboratorId={123} feed={feed} intl={mockIntl} permissions={{ 'create FeedInvitation': true }} onChange={() => {}} />);
    const input = wrapper.find('.int-feed-collab__text-field');
    input.simulate('change', { target: { value: 'bar@foo.com' } });
    wrapper.find('.int-feed-collab__add-button').simulate('click');
    expect(wrapper.find('.feed-collab-row__invitation-new').length).toEqual(1);
    expect(wrapper.find('.feed-collab-row__invitation-new').html()).toMatch('bar@foo.com');
  });

  it('should not display "Contact your workspace admin" message, when user has permissions to create FeedInvitation', () => {
    const permissions = {
      'create FeedInvitation': true,
    };

    const wrapper = mountWithIntl(<FeedCollaboration feed={feed} intl={mockIntl} permissions={permissions} onChange={() => {}} />);
    expect(wrapper.html()).not.toMatch('Contact your workspace admin to manage Collaborating organizations.');
  });

  it('should display "Contact your workspace admin" message, when user has no permissions to create FeedInvitation', () => {
    const permissions = {
      'create FeedInvitation': false,
    };

    const wrapper = mountWithIntl(<FeedCollaboration feed={feed} intl={mockIntl} permissions={permissions} readOnly onChange={() => {}} />);
    expect(wrapper.html()).toMatch('Contact your workspace admin to manage Collaborating organizations.');
  });
});
