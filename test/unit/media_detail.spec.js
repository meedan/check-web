import React from 'react';
import { IntlProvider } from 'react-intl';
import { render, shallow } from 'enzyme';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';

import MediaDetail from '../../src/app/components/media/MediaDetail';

const intlProvider = new IntlProvider({ locale: 'en', messages: {} }, {});
const { intl } = intlProvider.getChildContext();

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

  it('renders SocialMediaCard if media has URL and mode is condensed', () => {
    const mediaDetail = mountWithIntl(<MediaDetail media={media} condensed />);
    expect(mediaDetail.find('.social-media-card')).to.have.length(1);
    expect(mediaDetail.find('.social-media-card .pender-card')).to.have.length(1);
    expect(mediaDetail.find('.pender-card')).to.have.length(1);
  });

  it('renders PenderCard if media has URL and mode is not condensed', () => {
    const mediaDetail = mountWithIntl(<MediaDetail media={media} condensed={false} />);
    expect(mediaDetail.find('.social-media-card')).to.have.length(0);
    expect(mediaDetail.find('.social-media-card .pender-card')).to.have.length(0);
    expect(mediaDetail.find('.pender-card')).to.have.length(1);
  });
});
