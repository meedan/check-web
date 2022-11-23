import React from 'react';
import { shallow } from 'enzyme';
import WarningAlert from './WarningAlert';
import Alert from './Alert';

describe('<WarningAlert />', () => {
  it('should render WarningAlert component', () => {
    const wrapper = shallow(<WarningAlert
      title={<span>Foo</span>}
      content={<span>Bar</span>}
    />);
    expect(wrapper.find(Alert)).toHaveLength(1);
  });
});
