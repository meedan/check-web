/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import MediaTags from './MediaTags';

describe('<MediaTags />', () => {
  const media = {};

  const tags = [{ node: { tag: 123, id: '123', tag_text: 'tag1' } }, { node: { tag: 234, tag_text: 'suggestedTag3', id: '234' } }];

  it('renders correctly', () => {
    const mediaTags = mountWithIntlProvider(<MediaTags media={media} tags={tags} />);
    expect(mediaTags.find('.media-tags')).toHaveLength(1);
  });
});
