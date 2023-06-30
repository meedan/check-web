import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import FeedBlankState from './FeedBlankState';

describe('<FeedBlankState />', () => {
  it('should render FeedBlankState component with two links', () => {
    const feedBlankStateComponent = mountWithIntlProvider(<FeedBlankState teamSlug="test" feedDbid={1} listDbid={2} />);
    expect(feedBlankStateComponent.find('a').hostNodes()).toHaveLength(2);
  });

  it('should render FeedBlankState component with one link', () => {
    const feedBlankStateComponent = mountWithIntlProvider(<FeedBlankState teamSlug="test" feedDbid={1} />);
    expect(feedBlankStateComponent.find('a').hostNodes()).toHaveLength(1);
  });
});
