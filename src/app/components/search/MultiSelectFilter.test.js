import React from 'react';
import CloseIcon from '../../icons/clear.svg';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import MultiSelectFilter from './MultiSelectFilter';

describe('<MultiSelectFilter />', () => {
  const options = [
    { value: 'first', label: 'First' },
    { value: 'second', label: 'Second' },
    { value: 'third', label: 'Third' },
  ];

  it('should render a label and selected option', () => {
    const wrapper = mountWithIntl(<MultiSelectFilter
      selected={['second']}
      label="bar"
      options={options}
      onChange={() => {}}
      onRemove={() => {}}
      icon={<CloseIcon />}
    />);

    expect(wrapper.text().includes('bar')).toBe(true);
    expect(wrapper.find('Tag').text()).toBe('Second');
  });

  it('should render a special "Property deleted" tag if an unavailable option is selected', () => {
    const wrapper = mountWithIntl(<MultiSelectFilter
      selected={['foo']}
      label="bar"
      options={options}
      onChange={() => {}}
      onRemove={() => {}}
      icon={<CloseIcon />}
    />);

    expect(wrapper.find('Tag').text()).toBe('Property deleted');
  });

  it('should render only the label and no tags if oneOption is true', () => {
    const wrapper = mountWithIntl(<MultiSelectFilter
      selected={['foo']}
      label="bar"
      options={options}
      onChange={() => {}}
      onRemove={() => {}}
      icon={<CloseIcon />}
      oneOption
    />);

    expect(wrapper.find('Tag').length).toBe(0);
    expect(wrapper.text()).toBe('bar');
  });
});

