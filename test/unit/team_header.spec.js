import React from 'react';
import { mountWithIntl } from './helpers/intl-test';
import { Pulse } from '../../src/app/styles/js/shared';
import TeamHeader from '../../src/app/components/team/TeamHeader';

// Skip, because mounting a Relay component causes some async stuff that
// can break _future_ unit tests.
describe.skip('<TeamHeader />', () => {
  const params = { team: 'team-slug' };

  it('pulses while loading', () => {
    const teamHeader = mountWithIntl(<TeamHeader params={params} />);
    expect(teamHeader.find(Pulse));
  });
});
