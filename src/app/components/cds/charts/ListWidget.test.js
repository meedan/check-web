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
    itemLink: 'https://maze.toys/mazes/mini/daily/',
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

  it('renders without crashing', () => {
    mountWithIntl(<ListWidget {...props} />);
  });

  const colorNullProps = {
    color: null,
    items,
    title: 'Title',
  };

  it('renders without crashing if color is null', () => {
    mountWithIntl(<ListWidget {...colorNullProps} />);
  });
});
