/* global describe, expect, it */
import React from 'react';
import Chip from '@material-ui/core/Chip';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import LinkIcon from '@material-ui/icons/Link';
import TwitterIcon from '@material-ui/icons/Twitter';
import YouTubeIcon from '@material-ui/icons/YouTube';

import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import AccountChips from './AccountChips';

describe('<AccountChips />', () => {
  it('renders chips with their correct social network icons', () => {
    const accounts = [
      {
        id: '123',
        provider: 'facebook',
        url: 'http://www.facebook.com/foobar',
        metadata: { username: 'Foo Bar', url: 'http://www.facebook.com/foobar' },
      },
      {
        id: '124',
        provider: 'twitter',
        url: 'http://www.twitter.com/foobar',
        metadata: { username: 'Foo Bar', url: 'http://www.twitter.com/foobar' },
      },
      {
        id: '125',
        provider: '',
        url: 'http://www.foobar.com',
        metadata: { username: '', url: 'http://www.foobar.com' },
      },
    ];

    const accountChips = mountWithIntl(<AccountChips accounts={accounts} />);
    expect(accountChips.find(Chip)).toHaveLength(3);
    expect(accountChips.find(FacebookIcon)).toHaveLength(1);
    expect(accountChips.find(TwitterIcon)).toHaveLength(1);
    expect(accountChips.find(LinkIcon)).toHaveLength(1);
    expect(accountChips.find(InstagramIcon)).toHaveLength(0);
    expect(accountChips.find(YouTubeIcon)).toHaveLength(0);
  });
});
