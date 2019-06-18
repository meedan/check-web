import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';
import MediaDetail from '../../src/app/components/media/MediaDetail';

describe('<MediaDetail />', () => {
  const media = {
    metadata: {
      title: 'Title'
    },
    overridden: {},
    last_status: 'verified',
    last_status_obj: {
      locked: false,
    },
    verification_statuses: { statuses: [{ label: 'verified' }] },
    translation_statuses: { statuses: [{ label: 'translated' }] },
    log_count: 0,
    permissions: JSON.stringify({}),
    project_id: 1,
    media: {
      url: 'http://meedan.com',
      quote: '',
      metadata: { title: 'Title' },
    },
    team: { private: false },
    data: {
      title: 'Title'
    },
  };

  it('renders', () => {
    const mediaDetail = mountWithIntl(<MediaDetail media={media} />);
    expect(mediaDetail.find('.media-detail').at(0)).to.have.length(1);
  });
});
