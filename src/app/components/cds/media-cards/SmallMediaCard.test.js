import React from 'react';
import { shallow, mount } from 'enzyme';
import { SmallMediaCard } from './SmallMediaCard';

describe('SmallMediaCard', () => {
  const mockMedia = {
    type: 'Link',
    url: 'https://www.example.com/',
    domain: 'example.com',
    quote: 'This is an example quote',
    picture: 'https://www.example.com/image.jpg',
    metadata: {
      title: 'Example Title',
    },
  };

  const defaultProps = {
    media: mockMedia,
    details: [],
  };

  it('renders without crashing', () => {
    shallow(<SmallMediaCard {...defaultProps} />);
  });

  it('renders link', () => {
    const props = { ...defaultProps, media: { ...mockMedia, url: 'https://www.meedan.com' } };
    const wrapper = mount(<SmallMediaCard {...props} />);

    expect(wrapper.html()).toMatch('meedan.com');
  });

  it('displays custom title', () => {
    const props = { ...defaultProps, customTitle: 'Custom title' };
    const wrapper = mount(<SmallMediaCard {...props} />);

    expect(wrapper.html()).toMatch('Custom title');
  });
});
