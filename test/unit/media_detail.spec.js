import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';

import MediaDetail from '../../src/app/components/media/MediaDetail';

describe('<MediaDetail />', () => {
  const media = {
    embed: JSON.stringify({}),
    last_status: 'verified',
    verification_statuses: JSON.stringify({statuses: [{label: 'verified'}]}),
    annotations_count: 0,
    permissions: JSON.stringify({})
  };

  it('renders', function() {
    const mediaDetail = render(<MediaDetail media={media} />);
    expect(mediaDetail.find('.media-detail')).to.have.length(1);
  });
});
