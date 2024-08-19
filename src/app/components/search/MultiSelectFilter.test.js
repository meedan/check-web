import React from 'react';
import MultiSelectFilter from './MultiSelectFilter';
import CloseIcon from '../../icons/clear.svg';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<MultiSelectFilter />', () => {
  const options = [
    { value: 'first', label: 'First' },
    { value: 'second', label: 'Second' },
    { value: 'third', label: 'Third' },
  ];

  it('should render a label and selected option', () => {
    const wrapper = mountWithIntl(<MultiSelectFilter
      icon={<CloseIcon />}
      label="bar"
      options={options}
      selected={['second']}
      onChange={() => {}}
      onRemove={() => {}}
    />);

    expect(wrapper.text().includes('bar')).toBe(true);
    expect(wrapper.find('Tag').text()).toBe('Second');
  });

  it('should render a special "Property deleted" tag if an unavailable option is selected', () => {
    const wrapper = mountWithIntl(<MultiSelectFilter
      icon={<CloseIcon />}
      label="bar"
      options={options}
      selected={['foo']}
      onChange={() => {}}
      onRemove={() => {}}
    />);

    expect(wrapper.find('Tag').text()).toBe('Property deleted');
  });

  it('should render only the label and no tags if oneOption is true', () => {
    const wrapper = mountWithIntl(<MultiSelectFilter
      icon={<CloseIcon />}
      label="bar"
      oneOption
      options={options}
      selected={['foo']}
      onChange={() => {}}
      onRemove={() => {}}
    />);

    expect(wrapper.find('Tag').length).toBe(0);
    expect(wrapper.text()).toBe('bar');
  });
});

