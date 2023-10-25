import React from 'react';
import { shallow } from 'enzyme';
import MediaSimilarityBarComponent from './MediaSimilarityBarComponent';

describe('<MediaSimilarityBarComponent />', () => {
  it('should render basic item counts correctly', () => {
    const wrapper = shallow(<MediaSimilarityBarComponent
      projectMediaDbid={123}
      confirmedSimilarCount={20}
      isBlank
      setShowTab={() => {}}
    />);
    expect(wrapper.find('.similarity-bar__suggestions-count').prop('count')).toBe(10);
    expect(wrapper.find('.similarity-bar__matches-count').prop('count')).toBe(20);
  });
});
