import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import ConfirmDialog from './ConfirmDialog';

describe('<ConfirmDialog />', function() {
  it('should render title and blurb', function() {
    const wrapper = mountWithIntl(
      <ConfirmDialog
        open
        title="Dialog Title"
        blurb="Dialog Blurb"
        handleClose = {() => {}}
        handleConfirm={() => {}}
        children = '<div/>'
      />
    );
    expect(wrapper.html()).toMatch('Dialog Title');
    expect(wrapper.html()).toMatch('Dialog Blurb');
    expect(wrapper.find('#confirm-dialog__checkbox').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#confirm-dialog__cancel-action-button').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#confirm-dialog__confirm-action-button').hostNodes()).toHaveLength(1);
  });
});
