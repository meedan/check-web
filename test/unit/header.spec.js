import React from 'react';
import { expect } from 'chai';
import Relay from 'react-relay';
import Header from '../../src/app/components/Header';
import TeamHeader from '../../src/app/components/team/TeamHeader';
import { mountWithIntl } from './helpers/intl-test';

describe('<Header />', () => {
  it('renders team header on members page', () => {
    const location = { pathname: '/team/members' };
    const header = mountWithIntl(<Header location={location} params={{}} />);
    expect(header.find(TeamHeader)).to.have.length(1);
  });

  it('renders team header on join page', () => {
    const location = { pathname: '/team/join' };
    const header = mountWithIntl(<Header location={location} params={{}} />);
    expect(header.find(TeamHeader)).to.have.length(1);
  });
});
