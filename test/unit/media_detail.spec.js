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

  it('should not render a link while media is being processed', () => {
    const optimisticMedia = Object.assign({}, media);
    delete optimisticMedia.project_id;
    const mediaDetail = mountWithIntl(<MediaDetail media={media} />);
    const mediaHeadingLink = mediaDetail.find('.media__heading a').at(0);
    expect(mediaHeadingLink).to.have.length(0);
    const timestampLink = mediaDetail.find('.media-detail__check-timestamp a').at(0);
    expect(timestampLink).to.have.length(0);
    const notesCountLink = mediaDetail.find('.media-detail__check-notes-count a').at(0);
    expect(notesCountLink).to.have.length(0);
  });
});
