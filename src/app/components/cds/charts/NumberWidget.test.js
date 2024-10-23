import React from 'react';
import NumberWidget, { getDisplayValue } from './NumberWidget';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<NumberWidget />', () => {
  const props = {
    color: 'var(--color-purple-92)',
    contextText: 'A brief text giving some context.',
    itemCount: '2024',
    title: 'Title',
    unit: 'unit',
  };

  it('renders without crashing', () => {
    mountWithIntl(<NumberWidget {...props} />);
  });

  const nullProps = {
    color: null,
    contextText: null,
    itemCount: null,
    title: 'Title is required',
    unit: null,
  };

  it('renders without crashing if not required are null', () => {
    mountWithIntl(<NumberWidget {...nullProps} />);
  });

  it('displays the a random number, 0 or null correctly', () => {
    expect(getDisplayValue(0)).toEqual('0');
    expect(getDisplayValue(2024)).toEqual('2024');
    expect(getDisplayValue('0')).toEqual('0');
    expect(getDisplayValue('2024')).toEqual('2024');
    expect(getDisplayValue(null)).toEqual('-');
  });
});
