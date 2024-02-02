import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import { FeedCollaboration } from './FeedCollaboration';

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
  team: { dbid: 1 },

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

  it('should not display "Contact your workspace admin" message, when user has permissions to create FeedInvitation', () => {
    const permissions = {
      'create FeedInvitation': true,
    };

    const wrapper = mountWithIntl(<FeedCollaboration feed={feed} onChange={() => {}} permissions={permissions} intl={mockIntl} />);
    expect(wrapper.html()).not.toMatch('Contact your workspace admin to manage Collaborating organizations.');
  });

  it('should display "Contact your workspace admin" message, when user has no permissions to create FeedInvitation', () => {
    const permissions = {
      'create FeedInvitation': false,
    };

    const wrapper = mountWithIntl(<FeedCollaboration feed={feed} onChange={() => {}} permissions={permissions} intl={mockIntl} readOnly/>);
    expect(wrapper.html()).toMatch('Contact your workspace admin to manage Collaborating organizations.');
  });
});
