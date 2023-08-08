import React from 'react';
import { shallow } from 'enzyme';
import ButtonMain from './ButtonMain';

describe('<ButtonMain />', () => {
  it('should render ButtonMain component', () => {
    const buttonMain = shallow(<ButtonMain
      label={<span>Test</span>}
    />);
    const button = buttonMain.find('.test-label__button');
    expect(button).toHaveLength(1);
    expect(button.text()).toContain('Test');
  });
});
