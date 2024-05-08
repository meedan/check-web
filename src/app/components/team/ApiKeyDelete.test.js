import React from 'react';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import ApiKeyDelete from './ApiKeyDelete';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

describe('<ApiKeyDelete />', () => {
  it('should render', () => {
    const wrapper = shallowWithIntl(<ApiKeyDelete keyId="123" />);
    expect(wrapper.find(ButtonMain)).toHaveLength(1);
    expect(wrapper.find(ConfirmProceedDialog)).toHaveLength(1);
  });
});
