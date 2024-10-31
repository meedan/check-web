import React from 'react';
import Loader from './cds/loading/Loader';
import PenderCard from './PenderCard';
import { mountWithIntl } from '../../../test/unit/helpers/intl-test';

describe('<PenderCard />', () => {
  it('contains an SVG spinner if fallback is not provided', () => {
    const wrapper = mountWithIntl(<PenderCard />);
    expect(wrapper.find(Loader)).toHaveLength(1);
  });

  it('does not contain an SVG spinner component if fallback is provided', () => {
    const wrapper = mountWithIntl(<PenderCard fallback={<div />} />);
    expect(wrapper.find(Loader)).toHaveLength(0);
  });
});
