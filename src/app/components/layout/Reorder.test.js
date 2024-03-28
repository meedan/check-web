import React from 'react';
import { mount } from 'enzyme';
import Reorder from './Reorder';

describe('<Reorder />', () => {
  it('should render reorder up and reorder down buttons', () => {
    const wrapper = mount(<Reorder
      onMoveDown={() => {}}
      onMoveUp={() => {}}
    />);
    expect(wrapper.find('button').hostNodes()).toHaveLength(2);
    expect(wrapper.find('.int-reorder__button-up').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.int-reorder__button-down').hostNodes()).toHaveLength(1);
  });
});
