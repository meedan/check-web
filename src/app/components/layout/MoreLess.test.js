import React from 'react';
import { mount } from 'enzyme';
import MoreLess from './MoreLess';
import ParsedText from '../ParsedText';

describe('<MoreLess />', () => {
  const text = 'This is Meedan We are a technology non-profit that builds software and initiatives to strengthen global journalism, digital literacy and accessibility of information for the world. https://meedan.com/';
  const children = (<ParsedText text={text} canExpand isExpanded />);
  it('should render children text in more-less-content area', () => {
    const wrapper = mount(<MoreLess
      children={children}
      canExpand
      isExpanded

    />);
    expect(wrapper.find('.more-less-content span.Linkify').text()).toMatch('This is Meedan We are a technology non-profit that builds software and initiatives to strengthen global journalism');
    expect(wrapper.find('a').text()).toMatch('https://meedan.com/');
  });
});

