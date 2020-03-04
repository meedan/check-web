import React from 'react';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import Dialog from '@material-ui/core/Dialog';
import { mountWithIntl } from './helpers/intl-test';

import AttributionDialog from '../../src/app/components/user/AttributionDialog';

describe('<AttributionDialog />', () => {
  it('throws error if the taskType prop is not provided', () => {
    sinon.stub(console, 'error', (warning) => {
      if (/AttributionDialog/.test(warning)) {
        throw new Error(warning);
      }
      else {
        console.warn(warning);
      }
    });

    const wrapper = () => {
      mountWithIntl(<AttributionDialog open={false} />);
    };

    assert.throws(wrapper, Error, 'taskType');

    console.error.restore();
  });

  it('does not throw error if the taskType prop is provided', () => {
    const wrapper = mountWithIntl(<AttributionDialog taskType="geolocation" open={false} />);
    expect(wrapper.find(Dialog)).to.have.length(1);
  });
});
