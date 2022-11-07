import React from 'react';
import { shallow } from 'enzyme';
import CounterButton from './CounterButton';

describe('<CounterButton />', () => {
  it('should render CounterButton component', () => {
    const counterButton = shallow(<CounterButton
      count={12}
      label={<span>Widgets</span>}
      onClick={() => {}}
    />);
    const button = counterButton.find('.counter-button');
    expect(button).toHaveLength(1);
    expect(button.text()).toContain('Widgets');
    expect(button.text()).toContain('12');
    expect(button.props().onClick.toString()).toEqual('() => {}');
    // renders the 'moreThanZero' class when count > 0
    expect(button.props().className).toContain('moreThanZero');
  });

  it('should render with default onClick when undefined', () => {
    const counterButton = shallow(<CounterButton
      count={12}
      label={<span>Widgets</span>}
    />);
    const button = counterButton.find('.counter-button');
    expect(button).toHaveLength(1);
    expect(typeof button.props().onClick).toEqual('function');
  });

  it('should render with zeroCount class when count is 0', () => {
    const counterButton = shallow(<CounterButton
      count={0}
      label={<span>Widgets</span>}
      onClick={() => {}}
    />);
    const button = counterButton.find('.counter-button');
    expect(button.props().className).toContain('zeroCount');
  });
});

