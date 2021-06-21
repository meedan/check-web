import React from 'react';
import { mount } from 'enzyme';

import ParsedText from './ParsedText';

describe('<ParsedText />', () => {
  it('converts new lines to <br />s', () => {
    const text = 'Foo\nBar';
    const wrapper = mount(<ParsedText text={text} />);
    expect(wrapper.html()).toMatch('Foo<br>Bar');
  });

  it('converts links', () => {
    const wrapper = mount(<ParsedText text="Please visit http://meedan.com" />);
    expect(wrapper.html()).toMatch('<a href');
  });

  it('converts emojis', () => {
    const wrapper = mount(<ParsedText text="I :heart: U" />);
    expect(wrapper.html()).toMatch('<img');
  });
});
