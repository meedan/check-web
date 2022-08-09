import React from 'react';
import { mountWithIntl } from '../../../test/unit/helpers/intl-test';
import ChangePasswordComponent from './ChangePasswordComponent';

describe('<ChangePasswordComponent />', () => {
  it('should render Change Password Component', () => {
    const wrapper = mountWithIntl(<ChangePasswordComponent
      type="reset-password"
      showCurrentPassword="OldPaswword"
    />);
    expect(wrapper.find('.user-password-change__password-input')).toHaveLength(1);
    expect(wrapper.html()).toMatch('New password (minimum 8 characters)');
  });
});
