import React from 'react';
import { shallow, mount } from 'enzyme';
import TagList from './TagList';

describe('TagList', () => {
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
    const wrapper = mount(<TagList {...defaultProps} />);
    expect(wrapper.find('Chip')).toHaveLength(6);
    expect(wrapper.find('#empty-list')).toHaveLength(0);
    expect(wrapper.find('#hidden-tags')).toHaveLength(0);
    expect(wrapper.find('#tag-list__tag-icon')).toHaveLength(1);
    expect(wrapper.find('#tag-list__add-icon')).toHaveLength(1);
    expect(wrapper.find('#tag-list__tag-icon').prop('onClick')).toBeInstanceOf(Function);
    expect(wrapper.find('#tag-list__tag-icon').prop('disabled')).toBeFalsy();
  });

  it('renders empty tag list', () => {
    const wrapper = shallow(<TagList tags={[]} setTags={() => {}} />);
    expect(wrapper.find('Chip')).toHaveLength(0);
    expect(wrapper.find('#empty-list')).toHaveLength(1);
    expect(wrapper.find('#hidden-tags')).toHaveLength(0);
  });

  it('renders only up to maximum specified tags', () => {
    const wrapper = shallow(<TagList {...defaultProps} maxTags={3} />);
    // 3 tags plus the "hidden tags" Chip makes 4 Chip components
    expect(wrapper.find('Chip')).toHaveLength(4);
    expect(wrapper.find('#empty-list')).toHaveLength(0);
    expect(wrapper.find('#hidden-tags')).toHaveLength(1);
  });

  it('does not render menu buttons in read only mode', () => {
    const wrapper = mount(<TagList {...defaultProps} readOnly />);
    expect(wrapper.find('#tag-list__tag-icon')).toHaveLength(1);
    expect(wrapper.find('#tag-list__add-icon')).toHaveLength(0);
    expect(wrapper.find('#tag-list__tag-icon').prop('disabled')).toBeTruthy();
  });
});

