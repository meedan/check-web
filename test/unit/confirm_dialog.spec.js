import React from 'react';
import { mountWithIntl } from './helpers/intl-test';
import { expect } from 'chai';
import ConfirmDialog from '../../src/app/components/layout/ConfirmDialog';

describe('<ConfirmDialog />', function() {
  it('should render title and blurb', function() {
    const wrapper = mountWithIntl(
      <ConfirmDialog
        open
        title="Dialog Title"
        blurb="Dialog Blurb"
      />
    );
    expect(wrapper.html()).to.contain('Dialog Title');
    expect(wrapper.html()).to.contain('Dialog Blurb');
    expect(wrapper.find('#confirm-dialog__checkbox').hostNodes()).to.have.length(1);
    expect(wrapper.find('#confirm-dialog__cancel-action-button').hostNodes()).to.have.length(1);
    expect(wrapper.find('#confirm-dialog__confirm-action-button').hostNodes()).to.have.length(1);
  });
});
