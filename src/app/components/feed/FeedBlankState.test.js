import React from 'react';
import FeedBlankState from './FeedBlankState';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

describe('<FeedBlankState />', () => {
  it('should render FeedBlankState component with two links', () => {
    const feedBlankStateComponent = mountWithIntlProvider(<FeedBlankState feedDbid={1} listDbid={2} teamSlug="test" />);
    expect(feedBlankStateComponent.find('a').hostNodes()).toHaveLength(2);
  });

  it('should render FeedBlankState component with one link', () => {
    const feedBlankStateComponent = mountWithIntlProvider(<FeedBlankState feedDbid={1} teamSlug="test" />);
    expect(feedBlankStateComponent.find('a').hostNodes()).toHaveLength(1);
  });
});
