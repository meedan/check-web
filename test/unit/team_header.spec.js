import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';
import { Pulse } from '../../src/app/styles/js/shared';
import TeamHeaderRelay from '../../src/app/relay/containers/TeamHeaderRelay';

describe('<TeamHeaderRelay />', () => {
  const params = { team: 'team-slug' };

  it('pulses while loading', () => {
    const teamHeader = mountWithIntl(<TeamHeaderRelay params={params} />);
    expect(teamHeader.find(Pulse));
  });
});
