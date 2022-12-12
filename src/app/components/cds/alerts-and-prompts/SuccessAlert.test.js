import React from 'react';
import { shallow } from 'enzyme';
import SuccessAlert from './SuccessAlert';
import Alert from './Alert';

describe('<SuccessAlert />', () => {
  it('should render SuccessAlert component', () => {
    const wrapper = shallow(<SuccessAlert
      title={<span>Foo</span>}
      content={<span>Bar</span>}
    />);
    expect(wrapper.find(Alert)).toHaveLength(1);
  });
});
