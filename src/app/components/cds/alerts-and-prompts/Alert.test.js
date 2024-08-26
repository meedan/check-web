import React from 'react';
import { shallow } from 'enzyme';
import Alert from './Alert';

describe('<Alert />', () => {
  it('should render Alert component', () => {
    const wrapper = shallow(<Alert
      content={<span>Bar</span>}
      title={<span>Foo</span>}
      type="success"
    />);
    expect(wrapper.html()).toMatch('Foo');
    const content = wrapper.find('.test__alert-content');
    expect(content).toHaveLength(1);
    expect(content.text()).toContain('Bar');
  });
});
