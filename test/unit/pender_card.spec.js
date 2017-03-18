import React from 'react';
import { render, mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import PenderCard from '../../src/app/components/PenderCard';

describe('<PenderCard />', () => {
  it('contains an SVG spinner if fallback is not provided', function() {
    const wrapper = render(<PenderCard />);
    expect(wrapper.find('.spinner')).to.have.length(1);
  });

  it('does not contain an SVG spinner component if fallback is provided', function() {
    const wrapper = render(<PenderCard fallback={<div></div>} />);
    expect(wrapper.find('.spinner')).to.have.length(0);
  });

  it('does not reload if URL did not change', function() {
    sinon.spy(PenderCard.prototype, 'componentDidUpdate');

    const wrapper = mount(<PenderCard url='http://meedan.com' mediaVersion={0} />);

    expect(PenderCard.prototype.componentDidUpdate).to.have.property('callCount', 0);
    wrapper.setProps({ url: 'http://meedan.com' });
    expect(PenderCard.prototype.componentDidUpdate).to.have.property('callCount', 0);
    wrapper.setProps({ url: 'http://meedan.com/check' });
    expect(PenderCard.prototype.componentDidUpdate).to.have.property('callCount', 1);
    wrapper.setProps({ url: 'http://meedan.com/check' });
    expect(PenderCard.prototype.componentDidUpdate).to.have.property('callCount', 1);

    wrapper.setProps({ mediaVersion: 0 });
    expect(PenderCard.prototype.componentDidUpdate).to.have.property('callCount', 1);
    wrapper.setProps({ mediaVersion: 1 });
    expect(PenderCard.prototype.componentDidUpdate).to.have.property('callCount', 2);
    wrapper.setProps({ mediaVersion: 1 });
    expect(PenderCard.prototype.componentDidUpdate).to.have.property('callCount', 2);
  });
});
