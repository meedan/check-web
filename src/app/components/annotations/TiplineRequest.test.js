import React from 'react';
import TiplineRequest from './TiplineRequest';
import Request from '../cds/requests-annotations/Request';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<TiplineRequest />', () => {
  it('should display render Request card with proper data', () => {
    const media = { picture: 'foo' };
    const annotation = {
      value_json: {
        text: 'Hello Meedan',
        source: {
          type: 'whatsapp',
        },
      },
    };
    const wrapper = mountWithIntl((
      <TiplineRequest
        annotation={annotation}
        annotated={media}
      />
    ));
    expect(wrapper.find(Request).length).toEqual(1);
    // TODO Test messageText, reportReceiveStatus, all params
  });
});
