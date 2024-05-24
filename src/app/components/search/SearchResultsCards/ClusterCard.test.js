import React from 'react';
import { shallow } from 'enzyme';
import ClusterCard from './ClusterCard';

describe('<ClusterCard />', () => {
  it('should render', () => {
    const date = new Date();
    const wrapper = shallow(<ClusterCard
      title="Title"
      date={date}
    />);
    expect(wrapper.find('.workspace-item--card').length).toBe(1);
  });
});

describe('<ClusterCard />', () => {
  it('should be selectable by checkbox if onCheckboxChange provided', () => {
    const date = new Date();
    const wrapper = shallow(<ClusterCard
      title="Title"
      date={date}
      onCheckboxChange={() => {}}
    />);
    expect(wrapper.find('Checkbox').length).toBe(1);
  });

  it('should render the date', () => {
    const date = new Date();
    const wrapper = shallow(<ClusterCard
      title="Title"
      date={date}
    />);
    expect(wrapper.find('ItemDate').length).toBe(1);
  });
});
