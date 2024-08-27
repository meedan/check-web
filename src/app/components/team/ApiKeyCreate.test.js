import React from 'react';
import ApiKeyCreate from './ApiKeyCreate';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

describe('<ApiKeyCreate />', () => {
  it('should render', () => {
    const wrapper = shallowWithIntl(<ApiKeyCreate />);
    expect(wrapper.find('WithStyles(ForwardRef(Dialog))')).toHaveLength(1);
    expect(wrapper.find(ButtonMain)).toHaveLength(3);
  });
});
