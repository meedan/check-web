import React from 'react';
import FilterPopup from './FilterPopup';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<FilterPopup />', () => {
  it('should render filter dialog', () => {
    const wrapper = mountWithIntl(<FilterPopup
      onSearchChange={jest.fn(() => true)}
    />);
    wrapper.find('.filter-popup__open-button').hostNodes().simulate('click');
    expect(wrapper.find('.filter-popup__filter-search').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.filter-popup__close-button').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.filter-popup__close-button').hostNodes().html()).toMatch('Done');
  });
});
