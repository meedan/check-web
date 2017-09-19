import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';

import SourceTags from '../../src/app/components/source/SourceTags';

describe('<SourceTags />', () => {
  const tags = [{ node: { tag: 'tag1', id: '123' } }, { node: { tag: 'suggestedTag3', id: '234' } }];

  it('renders tags and input when editing', () => {
    const sourceTags = mountWithIntl(<SourceTags tags={tags} isEditing options={['asd', 'sdf', 'dfg']} />);
    expect(sourceTags.find('.source-tags__tag')).to.have.length(2);
    expect(sourceTags.find('#sourceTagInput')).to.have.length(1);
  });

  it('renders tags but no input when not editing', () => {
    const sourceTags = mountWithIntl(<SourceTags tags={tags} />);
    expect(sourceTags.find('.source-tags__tag')).to.have.length(2);
    expect(sourceTags.find('#sourceTagInput')).to.have.length(0);
  });
});
