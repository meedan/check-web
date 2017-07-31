import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';

import MediaTags from '../../src/app/components/media/MediaTags';

describe('<MediaTags />', () => {
  const media = {
    team: {
      get_suggested_tags: 'suggestedTag1,suggestedTag2,suggestedTag3',
    },
  };

  const tags = [{ node: { tag: 'tag1', id: '123' } }, { node: { tag: 'suggestedTag3', id: '234' } }];

  it('renders correctly when editing', () => {
    const mediaTags = mountWithIntl(<MediaTags media={media} tags={tags} isEditing />);
    expect(mediaTags.find('.media-tags')).to.have.length(1);
    expect(mediaTags.find('.media-tags--editing')).to.have.length(1);
  });

  it('renders correctly when not editing', () => {
    const mediaTags = mountWithIntl(<MediaTags media={media} tags={tags} isEditing={false} />);
    expect(mediaTags.find('.media-tags')).to.have.length(1);
    expect(mediaTags.find('.media-tags--editing')).to.have.length(0);
  });
});
