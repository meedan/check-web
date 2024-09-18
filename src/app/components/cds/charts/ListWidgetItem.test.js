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
    mountWithIntl(<ListWidgetItem {...props} />);
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
