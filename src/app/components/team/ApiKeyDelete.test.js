import React from 'react';
import ApiKeyDelete from './ApiKeyDelete';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

describe('<ApiKeyDelete />', () => {
  it('should render', () => {
    const wrapper = shallowWithIntl(<ApiKeyDelete keyId="123" />);
    expect(wrapper.find(ButtonMain)).toHaveLength(1);
    expect(wrapper.find(ConfirmProceedDialog)).toHaveLength(1);
  });
});
