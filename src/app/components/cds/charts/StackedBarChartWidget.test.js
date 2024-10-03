import React from 'react';
import { StackedBarChartWidget } from './StackedBarChartWidget';
import { shallowWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<StackedBarChartWidget />', () => {
  const props = {
    title: 'Sample data',
    data: [
      { name: 'Audio', value: 5000 },
      { name: 'Video', value: 4000 },
      { name: 'Text', value: 3000 },
      { name: 'Image', value: 2000 },
      { name: 'empty', value: 6000 },
    ],
  };

  it('renders without crashing', () => {
    const wrapper = shallowWithIntl(<StackedBarChartWidget {...props} />);
    expect(wrapper.html()).toContain('Sample data');
    expect(wrapper.find('BarChart')).toHaveLength(1);
  });
});
