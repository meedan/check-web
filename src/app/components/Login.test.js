/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../test/unit/helpers/intl-test';

import Login from './Login';

describe('<Login />', () => {
  it('should not have password confirmation in default login mode', () => {
    const wrapper = mountWithIntlProvider(<Login />);
    expect(wrapper.find('.login__password-confirmation-input')).toHaveLength(0);
  });
});
