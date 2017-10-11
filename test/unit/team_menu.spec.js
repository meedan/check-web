import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';
import TeamMenu from '../../src/app/components/team/TeamMenu';

describe('<TeamMenu />', () => {
  const team = {
    slug: 'team-slug',
    permissions: JSON.stringify({ 'update Team': false }),
  };

  it('should show "View team" if user is not allowed to manage team', () => {
    const teamMenu = mountWithIntl(<TeamMenu team={team} />);
    expect(teamMenu.find('MenuItem').text()).to.equal('View team');
  });
});
