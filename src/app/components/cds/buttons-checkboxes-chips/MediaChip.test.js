import React from 'react';
import { shallow } from 'enzyme';
import MediaChip from './MediaChip';

describe('<MediaChip />', () => {
  it('should display short url', () => {
    const wrapper = shallow(<MediaChip
      url="https://www.youtube.com/watch?v=IxMtrololoSFs"
      label="https://www.youtube.com/watch?v=IxMtrololoSFs"
    />);

    expect(wrapper.find('.media-chip-label').text().startsWith('http')).toBe(false);
    expect(wrapper.find('.media-chip-label').text().startsWith('youtube.com')).toBe(true);
  });

  it('should display icon', () => {
    const wrapper = shallow(<MediaChip
      url="https://foobar"
      label="foobar.jpg"
    />);

    expect(wrapper.find('MediaTypeDisplayIcon').props().mediaType).toEqual('UploadedImage');
  });
});
