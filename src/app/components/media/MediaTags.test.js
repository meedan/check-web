import React from 'react';
import { shallow } from 'enzyme';
import { MediaTags } from './MediaTags';

describe('<MediaTags />', () => {
  const projectMedia = {
    team: {
      slug: 'my-slug',
    },
    tags: {
      edges: [{ node: { tag: '123', id: '123', tag_text: 'tag1' } }, { node: { tag: '234', tag_text: 'suggestedTag3', id: '234' } }],
    },
  };

  it('renders tags correctly', () => {
    const mediaTags = shallow(<MediaTags projectMedia={projectMedia} />);
    expect(mediaTags.find('.media-tags')).toHaveLength(1);
    expect(mediaTags.find('.media-tags__tag').at(0).props().label).toEqual('tag1');
    expect(mediaTags.find('.media-tags__tag').at(1).props().label).toEqual('suggestedTag3');
  });
});
