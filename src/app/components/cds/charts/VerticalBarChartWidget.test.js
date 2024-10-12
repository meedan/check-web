import React from 'react';
import { VerticalBarChartWidget } from './VerticalBarChartWidget';
import { shallowWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<VerticalBarChartWidget />', () => {
  const props = {
    title: 'Sample data',
    data: [
      { name: 'A', value: 100 },
      { name: 'B', value: 200 },
      { name: 'C', value: 300 },
    ],
  };

  it('renders without crashing', () => {
    const wrapper = shallowWithIntl(<VerticalBarChartWidget {...props} />);
    expect(wrapper.html()).toContain('Sample data [600]');
    expect(wrapper.find('BarChart')).toHaveLength(1);
  });
});
