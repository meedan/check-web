import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';

import AccountCard from '../../src/app/components/source/AccountCard';

describe('<AccountCard />', () => {

  const account = { id: '123', provider: 'facebook', url: 'http://www.facebook.com/foobar', embed: { name: 'Foo Bar', username: 'foobar', url: 'http://www.facebook.com/foobar', picture: 'http://placehold.it/200x200', description: 'The Story of Foo Bar', raw: { api: {} } } };

  it('renders name, description and avatar', () => {
    const accountChips = mountWithIntl(<AccountCard account={account} />);
    expect(accountChips.find('.source-card__name').html()).to.contain(account.embed.name);
    expect(accountChips.find('.source-card__description').html()).to.contain(account.embed.description);
    expect(accountChips.find('.source-card__avatar').html()).to.contain(`<img alt="avatar" src="${account.embed.picture}"`);
  });

  it('links to account\'s URL', () => {
    const accountChips = mountWithIntl(<AccountCard account={account} />);
    expect(accountChips.find('.source-card__name').html()).to.contain(`<a href="${account.embed.url}"`);
    expect(accountChips.find('.source-card__url').html()).to.contain(`<a href="${account.embed.url}"`);
  });
});
