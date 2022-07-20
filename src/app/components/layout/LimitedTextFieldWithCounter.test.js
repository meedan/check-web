import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import LimitedTextFieldWithCounter from './LimitedTextFieldWithCounter';

describe('<LimitedTextFieldWithCounter />', () => {
  it('should display number of remaining characters', () => {
    const wrapper = mountWithIntl(<LimitedTextFieldWithCounter limit={10} value="Test" onUpdate={() => {}} />);
    expect(wrapper.html()).toMatch('6 characters left');
  });

  it('should NOT crash if value is null', () => {
    const wrapper = mountWithIntl(<LimitedTextFieldWithCounter limit={10} value={null} onUpdate={() => {}} />);
    expect(wrapper.html()).toMatch('10 characters left');
  });
});
