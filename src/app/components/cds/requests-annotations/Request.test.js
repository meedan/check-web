import React from 'react';
import Request from './Request';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<Request />', () => {
  it('should display render Request card with proper data', () => {
    const media = { picture: 'foo' };
    const wrapper = mountWithIntl((
      <Request
        details={[]}
        text="Hello Meedan"
        icon={<WhatsAppIcon />}
      />
    ));
    console.log('wrapper.debug()', wrapper.debug());
    expect(wrapper.find(WhatsAppIcon).length).toEqual(1);
  });
});