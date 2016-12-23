import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import LoginEmail from '../../src/app/components/LoginEmail';

describe('<LoginEmail />', () => {
  it('should have collapsed form by default', function() {
    const wrapper = shallow(<LoginEmail loginCallback={function() { }} />);
    expect(wrapper.state().open).to.equal(false);
  });
});
