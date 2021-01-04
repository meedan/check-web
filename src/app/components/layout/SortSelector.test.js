import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import SortSelector from './SortSelector';

describe('<SortSelector />', () => {
  it('should render correct sort option when value is "az"', () => {
    const wrapper = mountWithIntl(<SortSelector value="az" />);
    expect(wrapper.html()).toMatch('A to Z');
  });

  it('should render correct sort option when value is "za"', () => {
    const wrapper = mountWithIntl(<SortSelector value="za" />);
    expect(wrapper.html()).toMatch('Z to A');
  });

  it('should render correct sort option when value is "of"', () => {
    const wrapper = mountWithIntl(<SortSelector value="of" />);
    expect(wrapper.html()).toMatch('Oldest first');
  });

  it('should render correct sort option when value is "nf"', () => {
    const wrapper = mountWithIntl(<SortSelector value="nf" />);
    expect(wrapper.html()).toMatch('Newest first');
  });

  it('should render correct sort option when value is "mu"', () => {
    const wrapper = mountWithIntl(<SortSelector value="mu" />);
    expect(wrapper.html()).toMatch('Most used');
  });

  it('should render correct sort option when value is "lu"', () => {
    const wrapper = mountWithIntl(<SortSelector value="lu" />);
    expect(wrapper.html()).toMatch('Least used');
  });
});
