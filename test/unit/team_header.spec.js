import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';
import { Pulse } from '../../src/app/styles/js/shared';
import TeamHeader from '../../src/app/components/team/TeamHeader';

describe('<TeamHeader />', () => {
  const params = { team: 'team-slug' };

  it('pulses while loading', () => {
    const teamHeader = mountWithIntl(<TeamHeader params={params} />);
    expect(teamHeader.find(Pulse));
  });
});
