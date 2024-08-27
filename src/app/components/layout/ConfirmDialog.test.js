import React from 'react';
import ConfirmDialog from './ConfirmDialog';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<ConfirmDialog />', () => {
  it('should render title and blurb', () => {
    const wrapper = mountWithIntl(<ConfirmDialog
      blurb="Dialog Blurb"
      handleClose={() => {}}
      handleConfirm={() => {}}
      open
      title="Dialog Title"
    />);
    expect(wrapper.html()).toMatch('Dialog Title');
    expect(wrapper.html()).toMatch('Dialog Blurb');
    expect(wrapper.find('#confirm-dialog__checkbox').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#confirm-dialog__cancel-action-button').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#confirm-dialog__confirm-action-button').hostNodes()).toHaveLength(1);
  });
});
