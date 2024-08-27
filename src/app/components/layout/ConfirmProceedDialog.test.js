import React from 'react';
import ConfirmProceedDialog from './ConfirmProceedDialog';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<ConfirmProceedDialog />', () => {
  it('should render dialog title and content', () => {
    const wrapper = mountWithIntl(<ConfirmProceedDialog
      body="Body Content"
      open
      proceedLabel=""
      title="Dialog Title"
      onCancel={() => {}}
      onClick={() => {}}
      onProceed={() => {}}
    />);
    expect(wrapper.html()).toMatch('Dialog Title');
    expect(wrapper.html()).toMatch('Body Content');
    expect(wrapper.find('.int-confirm-proceed-dialog__cancel').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.int-confirm-proceed-dialog__proceed').hostNodes()).toHaveLength(1);
  });
});
