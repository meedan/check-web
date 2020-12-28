import React from 'react';
import { mount} from 'enzyme';
import BackArrow from './BackArrow';

describe('<BackArrow />', function() {
  const url = 'url'
  it('should render back button', function() {
    const wrapper = mount(<BackArrow url = {url}/>);
    expect(wrapper.find('.header__back-button').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.MuiSvgIcon-root').hostNodes()).toHaveLength(1);
  });
});
