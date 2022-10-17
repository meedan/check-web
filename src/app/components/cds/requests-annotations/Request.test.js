import React from 'react';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import Request from './Request';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<Request />', () => {
  it('should display render Request card with proper data', () => {
    const wrapper = mountWithIntl((
      <Request
        details={[]}
        text="Hello Meedan"
        icon={<WhatsAppIcon />}
      />
    ));
    expect(wrapper.find(WhatsAppIcon).length).toEqual(1);
  });
});
