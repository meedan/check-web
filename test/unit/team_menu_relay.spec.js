import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';
import TeamMenuRelay from '../../src/app/components/team/TeamMenuRelay';

describe('<TeamMenu />', () => {
  const team = {
    slug: 'team-slug',
    permissions: JSON.stringify({ 'update Team': false }),
  };

  it('show "View team" if user is not allowed to manage team', () => {
    const teamMenu = mountWithIntl(<TeamMenu team={team} />);
    expect(teamMenu.find('.menuitem').html().to.contain('View team'));
  });
});
