import React from 'react';
import { shallow } from 'enzyme';
import { MediaSuggestionBanner } from './MediaSuggestionBanner';

describe('<MediaSuggestionBanner />', () => {
  it('should render suggestion banner', () => {
    const wrapper = shallow(<MediaSuggestionBanner projectMedia={{ is_suggested: true, suggested_main_item: { id: 'UHJvamVjdE1lZGlhLzEK' }, suggested_main_relationship: { id: 'UmVsYXRpb25zaGlwLzEK' } }} />);
    expect(wrapper.find('Alert')).toHaveLength(1);
  });

  it('should not render suggestion banner', () => {
    const wrapper = shallow(<MediaSuggestionBanner projectMedia={{ is_suggested: false, suggested_main_item: {}, suggested_main_relationship: {} }} />);
    expect(wrapper.find('Alert')).toHaveLength(0);
  });
});
