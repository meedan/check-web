import React from 'react';
import { shallow } from 'enzyme';
import { MediaSecondaryBanner } from './index';

describe('<MediaSecondaryBanner />', () => {
  it('should not render suggestion banner or confirmation banner', () => {
    const wrapper = shallow(<MediaSecondaryBanner projectMedia={{ is_suggested: false, is_confirmed: false }} />);
    expect(wrapper.find('ForwardRef(Relay(MediaSuggestionBanner))')).toHaveLength(0);
    expect(wrapper.find('ForwardRef(Relay(MediaConfirmationBanner))')).toHaveLength(0);
  });

  it('should render suggestion banner', () => {
    const wrapper = shallow(<MediaSecondaryBanner projectMedia={{ is_suggested: true, is_confirmed: false }} />);
    expect(wrapper.find('ForwardRef(Relay(MediaSuggestionBanner))')).toHaveLength(1);
    expect(wrapper.find('ForwardRef(Relay(MediaConfirmationBanner))')).toHaveLength(0);
  });

  it('should render confirmation banner', () => {
    const wrapper = shallow(<MediaSecondaryBanner projectMedia={{ is_suggested: false, is_confirmed: true }} />);
    expect(wrapper.find('ForwardRef(Relay(MediaSuggestionBanner))')).toHaveLength(0);
    expect(wrapper.find('ForwardRef(Relay(MediaConfirmationBanner))')).toHaveLength(1);
  });
});
