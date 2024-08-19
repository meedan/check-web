import React from 'react';
import Request from './Request';
import WhatsAppIcon from '../../../icons/whatsapp.svg';
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
