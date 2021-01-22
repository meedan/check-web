import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import MultiSelector from './MultiSelector';

const selected = ['selecteOne', 'selectedTwo'];
const options = [
  { label: 'label 1', value: 'text 1' },
  { label: 'label 2', value: 'text 2' },
  { label: 'label 3', value: 'text 3' },
];

describe('<MultiSelector />', () => {
  it('should render options to be selected', () => {
    const wrapper = mountWithIntl(<MultiSelector
      allowToggleAll
      selected={selected}
      options={options}
      onSubmit={() => {}}
      onDismiss={() => {}}
    />);
    expect(wrapper.find('input[type="checkbox"]').hostNodes()).toHaveLength(4); // three options + select all option
    expect(wrapper.html()).toMatch('label 1');
    expect(wrapper.html()).toMatch('label 2');
    expect(wrapper.html()).toMatch('label 3');
    expect(wrapper.html()).toMatch('All');
  });

  it('should display "No items found" message when no option is found', () => {
    const wrapper = mountWithIntl(<MultiSelector
      selected={selected}
      options={[]}
      onSubmit={() => {}}
      onDismiss={() => {}}
    />);
    expect(wrapper.find('input[type="checkbox"]').hostNodes()).toHaveLength(0); // no field to be selected
    expect(wrapper.html()).toMatch('No items found');
  });
});
