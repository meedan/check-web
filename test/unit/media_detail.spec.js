import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';
import MediaDetail from '../../src/app/components/media/MediaDetail';

describe('<MediaDetail />', () => {
  const media = {
    embed: JSON.stringify({}),
    last_status: 'verified',
    verification_statuses: JSON.stringify({ statuses: [{ label: 'verified' }] }),
    translation_statuses: JSON.stringify({ statuses: [{ label: 'translated' }] }),
    log_count: 0,
    permissions: JSON.stringify({}),
    project_id: 1,
    media: { url: 'http://meedan.com', quote: '' },
    team: { private: false },
  };

  it('renders', () => {
    const mediaDetail = mountWithIntl(<MediaDetail media={media} />);
    expect(mediaDetail.find('.media-detail')).to.have.length(1);
  });
});
