import React from 'react';
import { mountWithIntl, getStore } from '../../../../../test/unit/helpers/intl-test';

import SlackConfig from './index';

describe('<SlackConfig />', () => {
  const ownerUser = {
    teams: '{"team-slug":{"id":2,"name":"Team Name","role":"owner","status":"member"}}',
  };

  const otherUser = {
    teams: '{"team-slug":{"id":2,"name":"Team Name","role":"editor","status":"member"}}',
  };

  const team = {
    slug: 'team-slug',
  };

  it('should render component for team owners', function() {
    getStore().currentUser = ownerUser;
    const wrapper = mountWithIntl(
      <SlackConfig
        team={team}
      />
    );
    expect(wrapper.html()).toMatch('Slack integration');
  });

  it('should not render component for other team members', function() {
    getStore().currentUser = otherUser;
    const wrapper = mountWithIntl(
      <SlackConfig
        team={team}
      />
    );
    expect(wrapper.html()).toEqual('');
  });
});
