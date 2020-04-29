import React from 'react';
import { currentUser, otherUser } from './mocks/user';
import { mountWithIntl, getStore } from './helpers/intl-test';
import SwitchTeamsComponent from '../../src/app/components/team/SwitchTeamsComponent';

describe('<SwitchTeamsComponent />', () => {
  it('should show private teams to members of the same team', () => {
    getStore().currentUser = currentUser;
    const switchTeam = mountWithIntl(<SwitchTeamsComponent user={otherUser} />);
    expect(switchTeam.find('.teams').children().at(0)).toHaveLength(1);
  });

  it('should not show deleted teams', () => {
    getStore().currentUser = currentUser;
    const switchTeam = mountWithIntl(<SwitchTeamsComponent user={otherUser} />);
    expect(switchTeam.find('.switch-teams__joined-team').hostNodes()).toHaveLength(1);
  });

  it('should show cancel join request button', () => {
    getStore().currentUser = otherUser;
    const switchTeam = mountWithIntl(<SwitchTeamsComponent user={otherUser} />);
    expect(switchTeam.find('.switch-team__cancel-request').hostNodes()).toHaveLength(1);
  });

  it('should not show cancel join button to other users', () => {
    getStore().currentUser = currentUser;
    const switchTeam = mountWithIntl(<SwitchTeamsComponent user={otherUser} />);
    expect(switchTeam.find('.switch-team__cancel-request').hostNodes()).toHaveLength(0);
  });
});
