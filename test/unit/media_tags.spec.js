import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';

import MediaTags from '../../src/app/components/media/MediaTags';

describe('<MediaTags />', () => {
  let media = {
    team: {
      get_suggested_tags: "suggestedTag1,suggestedTag2,suggestedTag3"
    }
  };

  let tags = [{node: {tag: 'tag1'}}, {node: {tag: 'suggestedTag3'}}];

  it('renders correctly when editing', function() {
    let mediaTags = mountWithIntl(<MediaTags media={media} tags={tags} isEditing={true} />);
    expect(mediaTags.find('.media-tags')).to.have.length(1);
    expect(mediaTags.find('.media-tags--editing')).to.have.length(1);
  });

  it('renders correctly when not editing', function() {
    let mediaTags = mountWithIntl(<MediaTags media={media} tags={tags} isEditing={false} />);
    expect(mediaTags.find('.media-tags')).to.have.length(1);
    expect(mediaTags.find('.media-tags--editing')).to.have.length(0);
  });
});
