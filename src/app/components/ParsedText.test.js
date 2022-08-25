import React from 'react';
import { mount } from 'enzyme';

import ParsedText from './ParsedText';

describe('<ParsedText />', () => {
  it('should converts new lines to <br />s', () => {
    const text = 'Foo\nBar';
    const wrapper = mount(<ParsedText text={text} />);
    expect(wrapper.html()).toMatch('Foo<br>Bar');
  });

  it('should converts links', () => {
    const wrapper = mount(<ParsedText text="Please visit http://meedan.com" />);
    expect(wrapper.html()).toMatch('<a href');
  });

  it('should parse URL when props is an array', () => {
    const wrapper = mount(<ParsedText text={[{ url: 'http://meedan.com' }]} />);
    expect(wrapper.html()).toMatch('<a href');
  });

  it('should converts emojis', () => {
    const wrapper = mount(<ParsedText text="I :heart: U" />);
    expect(wrapper.html()).toMatch('<img');
  });
});
