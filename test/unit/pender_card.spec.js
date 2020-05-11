import React from 'react';
import CircularProgress from '../../src/app/components/CircularProgress';
import { mountWithIntl } from './helpers/intl-test';

import PenderCard from '../../src/app/components/PenderCard';

describe('<PenderCard />', () => {
  it('contains an SVG spinner if fallback is not provided', () => {
    const wrapper = mountWithIntl(<PenderCard />);
    expect(wrapper.find(CircularProgress)).toHaveLength(1);
  });

  it('does not contain an SVG spinner component if fallback is provided', () => {
    const wrapper = mountWithIntl(<PenderCard fallback={<div />} />);
    expect(wrapper.find(CircularProgress)).toHaveLength(0);
  });
});
