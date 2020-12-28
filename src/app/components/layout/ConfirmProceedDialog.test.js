import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import ConfirmProceedDialog from './ConfirmProceedDialog';

describe('<ConfirmProceedDialog />', function() {
  it('should render dialog title and content', function() {
    const wrapper = mountWithIntl(
      <ConfirmProceedDialog
        open
        title='Dialog Title'
        body='Body Content'
        handleClose = {() => {}}
        handleConfirm={() => {}}
        children = '<div/>'
      />
    );
    expect(wrapper.html()).toMatch('Dialog Title');
    expect(wrapper.html()).toMatch('Body Content');
    expect(wrapper.find('.confirm-proceed-dialog__cancel').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.confirm-proceed-dialog__proceed').hostNodes()).toHaveLength(1);
  });
});
