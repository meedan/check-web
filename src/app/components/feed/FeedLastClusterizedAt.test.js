import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { FeedLastClusterizedAt } from './FeedLastClusterizedAt';

describe('<FeedLastClusterizedAt />', () => {
  it('should render the information about when the feed was last updated', () => {
    const feed = {
      last_clusterized_at: '2022-01-01T00:00:00Z', // specify a date string
    };
    const wrapper = mount(
      <IntlProvider locale="en">
        <FeedLastClusterizedAt feed={feed} />
      </IntlProvider>,
    );
    expect(wrapper.find('FormattedDate').exists()).toBe(true);
    expect(wrapper.html()).toMatch('Jan 01, 12:00 AM');
  });

  it('should render "pending initial update" information when last_clusterized_at is null', () => {
    const feed = {
      last_clusterized_at: null,
    };
    const wrapper = mount(
      <IntlProvider locale="en">
        <FeedLastClusterizedAt feed={feed} />
      </IntlProvider>,
    );
    expect(wrapper.find('FormattedDate').exists()).toBe(false);
    expect(wrapper.html()).toMatch('pending initial update');
  });
});
