/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

import Annotation from './Annotation';

describe('<Annotation />', () => {
  const timestamp = new Date('2017-02-08T17:19:40Z').valueOf() / 1000;

  const activity = {
    created_at: timestamp.toString(),
    event_type: 'create_comment',
    object_after: '{"data":{"text":"testing"},"annotated_id":2,"annotated_type":"ProjectMedia","annotation_type":"comment","annotator_type":"User","annotator_id":1}',
    annotation: {
      annotation_type: 'comment',
      content: JSON.stringify({ text: 'testing' }),
      updated_at: timestamp.toString(),
      created_at: timestamp.toString(),
      medias: { edges: [] },
      permissions: JSON.stringify({ 'read Comment': false, 'update Comment': true, 'destroy Comment': true }),
      annotator: { name: '', profile_image: null },
    },
    user: {
      source: {
        image: null,
      },
    },
  };

  const annotated = {};

  it('should render annotation updated_at time', () => {
    const wrapper = mountWithIntlProvider(<Annotation annotation={activity} annotated={annotated} annotatedType="ProjectMedia" />);
    const container = wrapper.find('.annotation__timestamp time');
    expect(container.length).toEqual(1);
    expect(container.prop('dateTime')).toEqual('2017-02-08T17:19:40.000Z');
  });
});
