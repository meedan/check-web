import React from 'react';
import { shallow } from 'enzyme';
import MediaChip from './MediaChip';

describe('<MediaChip />', () => {
  it('should display short url', () => {
    let wrapper = shallow(<MediaChip
      url="https://www.youtube.com/watch?v=IxMtrololoSFs"
      label="https://www.youtube.com/watch?v=IxMtrololoSFs"
    />);

    expect(wrapper.find('.media-chip-label').text().startsWith('http')).toBe(false);
    expect(wrapper.find('.media-chip-label').text().startsWith('youtube.com')).toBe(true);

    wrapper = shallow(<MediaChip
      url="https://www.nytimes.com/2023/09/07/climate/climate-forward-event.html"
      label="climate-forward-event.html"
    />);

    expect(wrapper.find('.media-chip-label').text()).toEqual("nytimes.com/2023/09/07/climate/climate-forward-event.html");
  });

  it('should display icon', () => {
    const wrapper = shallow(<MediaChip
      url="https://qa-assets.checkmedia.org/foobar"
      label="foobar.jpg"
    />);

    expect(wrapper.find('MediaTypeDisplayIcon').props().mediaType).toEqual('UploadedImage');
  });
});
