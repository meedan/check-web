import React from 'react';
import Login from './Login';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';


describe('<Login />', () => {
  it('should not have password confirmation in default login mode', () => {
    const wrapper = mountWithIntlProvider(<Login />);
    expect(wrapper.find('.int-login__password-confirmation-input')).toHaveLength(0);
  });
});
