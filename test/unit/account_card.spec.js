import React from 'react';
import { mountWithIntl } from './helpers/intl-test';

import AccountCard from '../../src/app/components/source/AccountCard';

describe('<AccountCard />', () => {
  const account = { image: 'http://placehold.it/200x200', id: '123', provider: 'facebook', url: 'http://www.facebook.com/foobar', metadata: { name: 'Foo Bar', username: 'foobar', url: 'http://www.facebook.com/foobar', picture: 'http://placehold.it/200x200', description: 'The Story of Foo Bar', raw: { api: {} } } };

  it('renders name, description and avatar', () => {
    const accountChips = mountWithIntl(<AccountCard account={account} />);
    expect(accountChips.find('.source-card__name').html()).toMatch(account.metadata.name);
    expect(accountChips.find('.source-card__description').html()).toMatch(account.metadata.description);
  });

  it('links to account\'s URL', () => {
    const accountChips = mountWithIntl(<AccountCard account={account} />);
    expect(accountChips.find('.source-card__name').html()).toMatch(`<a href="${account.metadata.url}"`);
    expect(accountChips.find('.source-card__url').html()).toMatch(`<a href="${account.metadata.url}"`);
  });
});
