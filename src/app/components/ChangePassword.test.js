import React from 'react';
import ChangePasswordComponent from './ChangePasswordComponent';
import { mountWithIntl } from '../../../test/unit/helpers/intl-test';

describe('<ChangePasswordComponent />', () => {
  it('should render Change Password Component', () => {
    const wrapper = mountWithIntl(<ChangePasswordComponent
      showCurrentPassword={false}
      type="reset-password"
    />);
    expect(wrapper.find('.int-user-password-change__password-input')).toHaveLength(1);
    expect(wrapper.html()).toMatch('New password (minimum 8 characters)');
  });
});
