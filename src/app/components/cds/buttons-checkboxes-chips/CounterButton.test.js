import React from 'react';
import { shallow } from 'enzyme';
import CounterButton from './CounterButton';
import ButtonMain from './ButtonMain';

describe('<CounterButton />', () => {
  it('should render CounterButton component using the ButtonMain component', () => {
    const counterButton = shallow(<CounterButton
      count={12}
      label={<span>Widgets</span>}
      onClick={() => {}}
    />);

    const button = counterButton.find(ButtonMain);
    expect(button).toHaveLength(1);
    expect(button.props().onClick.toString()).toEqual('() => {}');
  });

  it('should render with default onClick when undefined', () => {
    const counterButton = shallow(<CounterButton
      count={12}
      label={<span>Widgets</span>}
    />);
    const button = counterButton.find('.test__counter-button');
    expect(button).toHaveLength(1);
    expect(typeof button.props().onClick).toEqual('function');
  });

  it('should render with zeroCount class when count is 0', () => {
    const counterButton = shallow(<CounterButton
      count={0}
      label={<span>Widgets</span>}
      onClick={() => {}}
    />);
    const button = counterButton.find('.test__counter-button');
    expect(button.props().className).toContain('test__zeroCount');
  });
});
