import React from 'react';
import MediasLoading from './media/MediasLoading';
import { mountWithIntl } from '../../../test/unit/helpers/intl-test';
import PenderCard from './PenderCard';

describe('<PenderCard />', () => {
  it('contains an SVG spinner if fallback is not provided', () => {
    const wrapper = mountWithIntl(<PenderCard />);
    expect(wrapper.find(MediasLoading)).toHaveLength(1);
  });

  it('does not contain an SVG spinner component if fallback is provided', () => {
    const wrapper = mountWithIntl(<PenderCard fallback={<div />} />);
    expect(wrapper.find(MediasLoading)).toHaveLength(0);
  });
});
