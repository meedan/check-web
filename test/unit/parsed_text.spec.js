import React from 'react';
import { render, mount } from 'enzyme';
import { expect } from 'chai';

import ParsedText from '../../src/app/components/ParsedText';

describe('<ParsedText />', () => {
  it('converts new lines to <br />s', function() {
    const text = "Foo\nBar";
    const wrapper = render(<ParsedText text={text} />);
    expect(wrapper.html()).to.contain("Foo<br>Bar");
  });

  it('converts links', function() {
    const wrapper = render(<ParsedText text="Please visit http://meedan.com" />);
    expect(wrapper.html()).to.contain("<a href");
  });

  it('converts emojis', function() {
    const wrapper = render(<ParsedText text="I :heart: U" />);
    expect(wrapper.html()).to.contain("<img");
  });
});
