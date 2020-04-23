import React from 'react';
import { render, mount } from 'enzyme';

import ParsedText from '../../src/app/components/ParsedText';

describe('<ParsedText />', () => {
  it('converts new lines to <br />s', function() {
    const text = "Foo\nBar";
    const wrapper = render(<ParsedText text={text} />);
    expect(wrapper.html()).toMatch("Foo<br>Bar");
  });

  it('converts links', function() {
    const wrapper = render(<ParsedText text="Please visit http://meedan.com" />);
    expect(wrapper.html()).toMatch("<a href");
  });

  it('converts emojis', function() {
    const wrapper = render(<ParsedText text="I :heart: U" />);
    expect(wrapper.html()).toMatch("<img");
  });
});
