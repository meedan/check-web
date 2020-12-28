import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import SortSelector from './SortSelector';

describe('<SortSelector />', function() {
  it('should render correct sort option when value is "az"', function() {
    const wrapper = mountWithIntl(<SortSelector value = 'az' onclick open/>);
    expect(wrapper.html()).toMatch('A to Z');
  });

  it('should render correct sort option when value is "za"', function() {
    const wrapper = mountWithIntl(<SortSelector value = 'za' onclick open/>);
    expect(wrapper.html()).toMatch('Z to A');
  });

  it('should render correct sort option when value is "of"', function() {
    const wrapper = mountWithIntl(<SortSelector value = 'of' onclick open/>);
    expect(wrapper.html()).toMatch('Oldest first');
  });

  it('should render correct sort option when value is "nf"', function() {
    const wrapper = mountWithIntl(<SortSelector value = 'nf' onclick open/>);
    expect(wrapper.html()).toMatch('Newest first');
  });

  it('should render correct sort option when value is "mu"', function() {
    const wrapper = mountWithIntl(<SortSelector value = 'mu' onclick open/>);
    expect(wrapper.html()).toMatch('Most used');
  });

  it('should render correct sort option when value is "lu"', function() {
    const wrapper = mountWithIntl(<SortSelector value = 'lu' onclick open/>);
    expect(wrapper.html()).toMatch('Least used');
  });
});
