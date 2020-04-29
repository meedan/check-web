import React from 'react';
import CircularProgress from '../../src/app/components/CircularProgress';
import { mountWithMuiTheme } from './helpers/mui-test';

import PenderCard from '../../src/app/components/PenderCard';

describe('<PenderCard />', () => {
  it('contains an SVG spinner if fallback is not provided', () => {
    const wrapper = mountWithMuiTheme(<PenderCard />);
    expect(wrapper.find(CircularProgress)).toHaveLength(1);
  });

  it('does not contain an SVG spinner component if fallback is provided', () => {
    const wrapper = mountWithMuiTheme(<PenderCard fallback={<div />} />);
    expect(wrapper.find(CircularProgress)).toHaveLength(0);
  });
});
