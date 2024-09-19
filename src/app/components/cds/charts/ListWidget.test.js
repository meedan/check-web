import React from 'react';
import ListWidget from './ListWidget';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

const items = [
  {
    itemValue: '2024',
    itemText: 'Media Tag',
    id: 'item1',
  },
  {
    itemValue: '94607',
    itemText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam varius commodo malesuada',
    id: 'item2',
  },
  {
    itemValue: '120',
    itemLink: 'is.not/a/working/url/',
    itemText: 'Media Tag',
    id: 'item3',
  },
  {
    itemValue: '9423125367',
    itemLink: 'https://www.lipsum.com/feed/html',
    itemText: 'Lorem Ipsum URL',
    id: 'item4',
  },
  {
    itemText: 'Lorem ipsum dolor sit amet',
    id: 'item5',
  },
];

describe('<ListWidget />', () => {
  const props = {
    color: 'var(--color-purple-92)',
    items,
    title: 'Title',
  };

  it('renders as many items as there are in the items prop without crashing', () => {
    const listWidget = mountWithIntl(<ListWidget {...props} />);
    expect(listWidget.find('ListWidgetItem')).toHaveLength(5);
    expect(listWidget.text()).toContain('Title');
  });

  const colorNullProps = {
    color: null,
    items,
    title: 'Title',
  };

  it('renders as many items as there are in the items prop without crashing if color is null', () => {
    const listWidget = mountWithIntl(<ListWidget {...colorNullProps} />);
    expect(listWidget.find('ListWidgetItem')).toHaveLength(5);
    expect(listWidget.text()).toContain('Title');
  });
});
