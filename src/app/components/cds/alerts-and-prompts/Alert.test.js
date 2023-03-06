import React from 'react';
import { shallow } from 'enzyme';
import Alert from './Alert';

describe('<Alert />', () => {
  it('should render Alert component', () => {
    const alertBox = shallow(<Alert
      title={<span>Foo</span>}
      content={<span>Bar</span>}
      type="success"
    />);
    const title = alertBox.find('.alert-title');
    expect(title).toHaveLength(1);
    expect(title.text()).toContain('Foo');
    const content = alertBox.find('.alert-content');
    expect(content).toHaveLength(1);
    expect(content.text()).toContain('Bar');
  });
});
