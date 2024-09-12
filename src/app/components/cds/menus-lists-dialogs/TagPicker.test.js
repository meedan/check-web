import React from 'react';
import { mount } from 'enzyme';
import TagPicker from './TagPicker';

describe('TagPicker', () => {
  const defaultProps = {
    tags: [
      'first',
      'second',
      'Third is Quite Long',
      'fourth',
      'fifth!',
      'This is Six',
    ],
    setTags: () => {},
  };

  it('renders without crashing', () => {
    const wrapper = mount(<TagPicker {...defaultProps} />);
    expect(wrapper.find('ButtonMain.int-tag-list__button--manage')).toHaveLength(1);
    expect(wrapper.find('ButtonMain.int-tag-list__button--manage').prop('onClick')).toBeInstanceOf(Function);
  });
});

