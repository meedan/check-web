import React from 'react';
import NumberWidget from './NumberWidget';
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
    title: null,
    unit: null,
  };

  it('renders without crashing if languages is null', () => {
    mountWithIntl(<NumberWidget {...nullProps} />);
  });
});
