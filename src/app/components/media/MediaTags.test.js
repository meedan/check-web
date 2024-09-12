import React from 'react';
import { shallow } from 'enzyme';
import { MediaTags } from './MediaTags';
import TagList from '../cds/menus-lists-dialogs/TagList';

describe('<MediaTags />', () => {
  const projectMedia = {
    permissions: '{"update ProjectMedia":true}',
    team: {
      slug: 'my-slug',
    },
    tags: {
      edges: [{ node: { tag: '123', id: '123', tag_text: 'tag1' } }, { node: { tag: '234', tag_text: 'suggestedTag3', id: '234' } }],
    },
  };

  it('renders TagList with correct props', () => {
    const mediaTags = shallow(<MediaTags projectMedia={projectMedia} />);
    expect(mediaTags.find(TagList)).toHaveLength(1);
    expect(mediaTags.find(TagList).props().readOnly).toEqual(false);
    expect(mediaTags.find(TagList).props().teamSlug).toEqual(projectMedia.team.slug);
    expect(mediaTags.find(TagList).props().tags).toHaveLength(2);
  });
});
