import React from 'react';
import FeedDataPoints from './FeedDataPoints';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';

describe('<FeedDataPoints />', () => {
  it('should display warning if read-only', () => {
    let wrapper = shallowWithIntl(<FeedDataPoints readOnly />);
    expect(wrapper.find('Alert')).toHaveLength(1);

    wrapper = shallowWithIntl(<FeedDataPoints readOnly={false} />);
    expect(wrapper.find('Alert')).toHaveLength(0);
  });

  it('should disable sections if read-only', () => {
    let wrapper = shallowWithIntl(<FeedDataPoints readOnly />);
    expect(wrapper.find('FeedDataPointsSection').first().prop('readOnly')).toBe(true);
    expect(wrapper.find('FeedDataPointsSection').last().prop('readOnly')).toBe(true);

    wrapper = shallowWithIntl(<FeedDataPoints readOnly={false} />);
    expect(wrapper.find('FeedDataPointsSection').first().prop('readOnly')).toBe(false);
    expect(wrapper.find('FeedDataPointsSection').last().prop('readOnly')).toBe(false);
  });

  it('should toggle sections based on data points', () => {
    let wrapper = shallowWithIntl(<FeedDataPoints dataPoints={[]} />);
    expect(wrapper.find('FeedDataPointsSection').first().prop('enabled')).toBe(false);
    expect(wrapper.find('FeedDataPointsSection').last().prop('enabled')).toBe(false);

    wrapper = shallowWithIntl(<FeedDataPoints dataPoints={[CheckFeedDataPoints.PUBLISHED_FACT_CHECKS, CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS]} />);
    expect(wrapper.find('FeedDataPointsSection').first().prop('enabled')).toBe(true);
    expect(wrapper.find('FeedDataPointsSection').last().prop('enabled')).toBe(true);

    wrapper = shallowWithIntl(<FeedDataPoints dataPoints={[CheckFeedDataPoints.PUBLISHED_FACT_CHECKS]} />);
    expect(wrapper.find('FeedDataPointsSection').first().prop('enabled')).toBe(true);
    expect(wrapper.find('FeedDataPointsSection').last().prop('enabled')).toBe(false);

    wrapper = shallowWithIntl(<FeedDataPoints dataPoints={[CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS]} />);
    expect(wrapper.find('FeedDataPointsSection').first().prop('enabled')).toBe(false);
    expect(wrapper.find('FeedDataPointsSection').last().prop('enabled')).toBe(true);
  });
});
