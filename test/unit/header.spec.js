import React from 'react';
import Relay from 'react-relay';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import Header from '../../src/app/components/Header';
import TeamHeader from '../../src/app/components/team/TeamHeader';
import TeamPublicHeader from '../../src/app/components/team/TeamPublicHeader';

describe('<Header />', () => {
  it('renders full team header on members page', function() {
    const location = { pathname: '/members' };
    const header = shallow(<Header location={location} params={{}} />);
    expect(header.find(TeamHeader)).to.have.length(1);
    expect(header.find(TeamPublicHeader)).to.have.length(0);
  });

  it('renders public team header on team join page', function() {
    const location = { pathname: '/join' };
    const header = shallow(<Header location={location} params={{}} />);
    expect(header.find(TeamHeader)).to.have.length(0);
    expect(header.find(TeamPublicHeader)).to.have.length(1);
  });
});
