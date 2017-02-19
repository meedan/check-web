import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';

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
});
