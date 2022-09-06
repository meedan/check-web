import React from 'react';
import { shallow } from 'enzyme';
import { TagMenuTest } from './TagMenu';

describe('<TagMenu />', () => {
  const projectMedia = {
    permissions: '{"update ProjectMedia":true}',
    team: {
      tag_texts: {
        edges: [
          { node: { text: 'tag1' } },
          { node: { text: 'tag2' } },
          { node: { text: 'tag3' } },
        ],
      },
    },
    tags: {
      edges: [
        { node: { tag: '123', id: '123', tag_text: 'tag1' } },
        { node: { tag: '234', tag_text: 'tag3', id: '234' } },
      ],
    },
  };

  it('renders tag menu correctly', () => {
    const tagMenu = shallow(<TagMenuTest media={projectMedia} relay={{}} setFlashMessage={() => {}} />);
    expect(tagMenu.find('.tag-menu__icon')).toHaveLength(1);

    const popover = tagMenu.find('FormattedMessage').props().children();
    expect(popover.props.options).toHaveLength(3);
    expect(popover.props.selected).toHaveLength(2);
  });
});

