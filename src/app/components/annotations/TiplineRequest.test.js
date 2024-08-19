import React from 'react';
import TiplineRequest from './TiplineRequest';
import Request from '../cds/requests-annotations/Request';
import { mountWithIntl, mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

const media = {
  id: 'TWVkaWEvMQ==\n',
  picture: 'foo',
  media: {
    file_path: '',
  },
};

const annotation = {
  created_at: '1692731080',
  annotation_id: 12345,
  smooch_report_received_at: 1692731090,
  smooch_report_update_received_at: 1692731095,
  smooch_user_external_identifier: 'test',
  associated_graphql_id: 'UHJvamVjdE1lZGlhLzE=\n',
  smooch_data: {
    name: 'Bli',
    authorId: 'blo',
    text: 'Hello Meedan',
    source: {
      type: 'whatsapp',
    },
  },
};

describe('<TiplineRequest />', () => {
  it('should display request card with proper data', () => {
    const wrapper = mountWithIntl((
      <TiplineRequest
        annotated={media}
        annotation={annotation}
      />
    ));
    expect(wrapper.find(Request).length).toEqual(1);
    expect(wrapper.html()).toMatch('Correction delivered on Aug 22, 2023');
    expect(wrapper.html()).toMatch('Hello Meedan');
  });

  it('should localize date in request card', () => {
    const wrapper = mountWithIntlProvider((
      <TiplineRequest
        annotated={media}
        annotation={annotation}
      />
    ), { locale: 'fr' });
    expect(wrapper.html()).toMatch('22 août 2023');
    expect(wrapper.html()).not.toMatch('Invalid Date');
  });

  it('should localize date in request card 2', () => {
    const wrapper = mountWithIntlProvider((
      <TiplineRequest
        annotated={media}
        annotation={{ ...annotation, smooch_report_update_received_at: 1691636400 }}
      />
    ), { locale: 'fr' });
    expect(wrapper.html()).toMatch('10 août 2023');
    expect(wrapper.html()).not.toMatch('08 oct. 2023');
  });
});
