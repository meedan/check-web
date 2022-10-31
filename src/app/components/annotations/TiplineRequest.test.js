import React from 'react';
import TiplineRequest from './TiplineRequest';
import Request from '../cds/requests-annotations/Request';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<TiplineRequest />', () => {
  it('should display render Request card with proper data', () => {
    const media = { picture: 'foo' };
    const annotation = {
      smooch_report_received_at: 1666157415,
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
    expect(wrapper.html()).toMatch('Report sent on Oct 19, 2022');
    expect(wrapper.html()).toMatch('Hello Meedan');
  });
});
