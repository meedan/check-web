import React from 'react';
import ListSort from './ListSort';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<ListSort />', () => {
  it('should render ListSort component', () => {
    const listSort = mountWithIntl(<ListSort />);
    const dropDown = listSort.find('.list-sort');
    expect(dropDown).toHaveLength(1);
    expect(dropDown.text()).toContain('Sort');
  });

  it('should show selected option', () => {
    let listSort = mountWithIntl(<ListSort sort="status_index" />);
    let selectedOption = listSort.find('.list-sort select');
    expect(selectedOption.props().value).toBe('status_index');

    listSort = mountWithIntl(<ListSort sort="recent_activity" />);
    selectedOption = listSort.find('.list-sort select');
    expect(selectedOption.props().value).toBe('recent_activity');
  });

  it('should show selected sorting order', () => {
    let listSort = mountWithIntl(<ListSort sortType="ASC" />);
    expect(listSort.find('button').props().className).toContain('list-sort-asc');

    listSort = mountWithIntl(<ListSort sortType="DESC" />);
    expect(listSort.find('button').props().className).toContain('list-sort-desc');
  });
});
