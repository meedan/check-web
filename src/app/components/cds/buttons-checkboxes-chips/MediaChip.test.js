import React from 'react';
import { shallow } from 'enzyme';
import MediaChip from './MediaChip';

describe('<MediaChip />', () => {
  it('should display short url', () => {
    let wrapper = shallow(<MediaChip
      label="https://www.youtube.com/watch?v=IxMtrololoSFs"
      url="https://www.youtube.com/watch?v=IxMtrololoSFs"
    />);

    expect(wrapper.find('.media-chip-label').text()).toEqual('youtube.com/watch?v=IxMtrololoSFs');

    wrapper = shallow(<MediaChip
      label="climate-forward-event.html"
      url="https://www.nytimes.com/2023/09/07/climate/climate-forward-event.html"
    />);

    expect(wrapper.find('.media-chip-label').text()).toEqual('nytimes.com/2023/09/07/climate/climate-forward-event.html');

    wrapper = shallow(<MediaChip
      label="https://www.twitter.com/rtyuuty/3456436"
      url="https://www.twitter.com/rtyuuty/3456436"
    />);

    expect(wrapper.find('.media-chip-label').text()).toEqual('twitter.com/rtyuuty/3456436');
  });

  it('should display icon', () => {
    const wrapper = shallow(<MediaChip
      label="foobar.jpg"
      url="https://qa-assets.checkmedia.org/foobar"
    />);

    expect(wrapper.find('MediaTypeDisplayIcon').props().mediaType).toEqual('UploadedImage');
  });
});
