import React from 'react';
import Chip from '../cds/buttons-checkboxes-chips/Chip';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import AccountChips from './AccountChips';

describe('<AccountChips />', () => {
  it('should renders chips', () => {
    const accounts = [
      {
        id: '123',
        provider: '',
        url: 'http://www.facebook.com/foobar',
        metadata: { username: 'Foo Bar', url: 'http://www.facebook.com/foobar' },
      },
      {
        id: '124',
        provider: '',
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
  });
});
