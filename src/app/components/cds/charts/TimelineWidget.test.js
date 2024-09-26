import React from 'react';
import { TimelineWidget } from './TimelineWidget';
import { shallowWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<TimelineWidget />', () => {
  const props = {
    title: 'Sample data',
    data: [
      { date: '2024-06-01', value: 100 },
      { name: '2024-06-02', value: 200 },
      { name: '2024-06-03', value: 300 },
    ],
  };

  it('renders without crashing', () => {
    const wrapper = shallowWithIntl(<TimelineWidget {...props} />);
    expect(wrapper.html()).toContain('Sample data');
    expect(wrapper.find('AreaChart')).toHaveLength(1);
  });
});
