import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';

import PenderCard from '../../src/app/components/PenderCard';

describe('<PenderCard />', () => {
  it('contains an <Spinner /> component if fallback is not provided', function() {
    const wrapper = render(<PenderCard />);
    expect(wrapper.find('.react-spinner')).to.have.length(1);
  });

  it('does not contain an <Spinner /> component if fallback is provided', function() {
    const wrapper = render(<PenderCard fallback={<div></div>} />);
    expect(wrapper.find('.react-spinner')).to.have.length(0);
  });
});
