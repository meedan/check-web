import React from 'react';
import { expect } from 'chai';
import IconDelete from 'material-ui/svg-icons/action/delete';
import { mountWithIntl } from './helpers/intl-test';
import TeamMenu from '../../src/app/components/team/TeamMenu';

describe('<TeamMenu />', () => {
  const team = {
    slug: 'team-slug',
    permissions: JSON.stringify({ 'update Team': false }),
  };

  it('should show trash icon if user is a team member', () => {
    const teamMenu = mountWithIntl(<TeamMenu team={team} currentUserIsMember />);
    expect(teamMenu.find(IconDelete)).to.have.length(1);
  });

  it('should not show trash icon if user is not a team member', () => {
    const teamMenu = mountWithIntl(<TeamMenu team={team} />);
    expect(teamMenu.find(IconDelete)).to.have.length(0);
  });

  it('should not show trash icon if user is not signed in', () => {
    const teamMenu = mountWithIntl(<TeamMenu team={team} />);
    expect(teamMenu.find(IconDelete)).to.have.length(0);
  });
});
