import React from 'react';
import { shallow } from 'enzyme';
import { MediaTags } from './MediaTags';

describe('<MediaTags />', () => {
  const projectMedia = {
    tags: {
      edges: [{ node: { tag: '123', id: '123', tag_text: 'tag1' } }, { node: { tag: '234', tag_text: 'suggestedTag3', id: '234' } }],
    },
  };

  it('renders correctly', () => {
    const mediaTags = shallow(<MediaTags projectMedia={projectMedia} />);
    expect(mediaTags.find('.media-tags')).toHaveLength(1);
  });
});
