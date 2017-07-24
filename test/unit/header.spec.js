import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import Header from '../../src/app/components/Header';
import TeamHeader from '../../src/app/components/team/TeamHeader';

describe('<Header />', () => {
  it('renders full team header on members page', () => {
    const location = { pathname: '/team/members' };
    const header = shallow(<Header location={location} params={{}} />);
    expect(header.find(TeamHeader)).to.have.length(1);
  });
});

// TODO — We used to have a component "TeamPublicHeader" which this test exercised, but it didn't add a lot of value so it's been removed. Now this test does not do much. We should improve it to better exercise header logic, as we need it. CGB 2017-7-23
