import React from 'react';
import ListWidgetItem from './ListWidgetItem';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<ListWidgetItem />', () => {
  const props = {
    id: 'id',
    itemLink: 'https://www.example.com/',
    itemText: 'Lorem ipsum dolor sit amet',
    itemValue: '2024',
  };

  it('renders without crashing', () => {
    const item = mountWithIntl(<ListWidgetItem {...props} />);
    expect(item.text()).toContain('Lorem ipsum dolor sit amet');
    expect(item.text()).toContain('2024');
    expect(item.html()).toContain('https://www.example.com/');
  });

  const nullProps = {
    id: null,
    itemLink: null,
    itemText: null,
    itemValue: null,
  };

  it('renders without crashing if props are null', () => {
    mountWithIntl(<ListWidgetItem {...nullProps} />);
  });
});
