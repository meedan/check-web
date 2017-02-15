import React from 'react';
import { IntlProvider } from 'react-intl';
import { render, shallow } from 'enzyme';
import { expect } from 'chai';
import { shallowWithIntl } from './helpers/intl-enzyme-test-helper.js';

import MediaDetail from '../../src/app/components/media/MediaDetail';
import SocialMediaCard from '../../src/app/components/media/SocialMediaCard';
import PenderCard from '../../src/app/components/PenderCard';

describe('<MediaDetail />', () => {
  let media = {
    embed: JSON.stringify({}),
    last_status: 'verified',
    verification_statuses: JSON.stringify({statuses: [{label: 'verified'}]}),
    annotations_count: 0,
    permissions: JSON.stringify({}),
    media: { url: 'http://meedan.com', quote: '' }
  };

  it('renders', function() {
    const mediaDetail = render(<IntlProvider locale="en"><MediaDetail media={media} /></IntlProvider>);
    expect(mediaDetail.find('.media-detail')).to.have.length(1);
  });

  it('renders SocialMediaCard if media has URL and mode is condensed', function() {
    const mediaDetail = shallowWithIntl(<MediaDetail media={media} condensed={true} />);
    expect(mediaDetail.find(SocialMediaCard)).to.have.length(1);
    expect(mediaDetail.find(PenderCard)).to.have.length(0);
  });

  it('renders PenderCard if media has URL and mode is not condensed', function() {
    const mediaDetail = shallowWithIntl(<MediaDetail media={media} condensed={false} />);
    expect(mediaDetail.find(SocialMediaCard)).to.have.length(0);
    expect(mediaDetail.find(PenderCard)).to.have.length(1);
  });
});
