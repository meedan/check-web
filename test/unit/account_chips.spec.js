import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';

import FaFacebookSquare from 'react-icons/lib/fa/facebook-square';
import FaTwitter from 'react-icons/lib/fa/twitter';
import MdLink from 'react-icons/lib/md/link';
import FaInstagram from 'react-icons/lib/fa/instagram';
import FaYoutubePlay from 'react-icons/lib/fa/youtube-play';

import AccountChips from '../../src/app/components/source/AccountChips';

describe('<AccountChips />', () => {
  const accounts = [{ id: '123', provider: 'facebook', url: 'http://www.facebook.com/foobar', metadata: { username: 'Foo Bar', url: 'http://www.facebook.com/foobar' } },
                    { id: '124', provider: 'twitter', url: 'http://www.twitter.com/foobar', metadata: { username: 'Foo Bar', url: 'http://www.twitter.com/foobar' } },
                    { id: '125', provider: '', url: 'http://www.foobar.com', metadata: { username: '', url: 'http://www.foobar.com' } }];

  it('renders chips with their correct social network icons', () => {
    const accountChips = mountWithIntl(<AccountChips accounts={accounts} />);
    expect(accountChips.find('.media-tags__tag')).to.have.length(6);
    expect(accountChips.find(FaFacebookSquare)).to.have.length(1);
    expect(accountChips.find(FaTwitter)).to.have.length(1);
    expect(accountChips.find(MdLink)).to.have.length(1);
    expect(accountChips.find(FaInstagram)).to.have.length(0);
    expect(accountChips.find(FaYoutubePlay)).to.have.length(0);
  });
});
