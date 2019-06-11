import React from 'react';
import { expect } from 'chai';
import { mountWithIntl, getStore } from './helpers/intl-test';

import SlackConfig from '../../src/app/components/team/SlackConfig';

describe('<SlackConfig />', () => {
  const ownerUser = {
    teams: '{"team-slug":{"id":2,"name":"Team Name","role":"owner","status":"member"}}',
  };

  const otherUser = {
    teams: '{"team-slug":{"id":2,"name":"Team Name","role":"editor","status":"member"}}',
  };

  const team = {
    slug: 'team-slug',
    limits: {
      slack_integration: true,
    }
  };

  it('should render component for team owners', function() {
    getStore().currentUser = ownerUser;
    const wrapper = mountWithIntl(
      <SlackConfig
        team={team}
      />
    );
    expect(wrapper.html()).to.contain('Slack integration');
  });

  it('should not render component for other team members', function() {
    getStore().currentUser = otherUser;
    const wrapper = mountWithIntl(
      <SlackConfig
        team={team}
      />
    );
    expect(wrapper.html()).to.equal('');
  });
});
