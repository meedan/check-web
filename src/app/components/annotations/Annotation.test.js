import React from 'react';
import Annotation from './Annotation';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const annotation = {
  id: 'VmVyc2lvbi8xMzE4\n',
  dbid: 1318,
  item_type: 'Dynamic',
  item_id: '1766',
  event: 'update',
  event_type: 'update_dynamic',
  created_at: '1657904596',
  object_after: '{"id":1766,"data":{"options":[{"language":"en","use_text_message":true,"use_introduction":true,"introduction":"blo","status_label":"Inconclusive","theme_color":"#9e9e9e","image":"","title":"blabla","headline":"blabla","text":"the blabla doesn\'t exist","description":"the blabla doesn\'t exist","published_article_url":"https://lol.com/blabla","previous_published_status_label":"Inconclusive"}],"state":"paused","last_published":"1657718501","first_published":"1656710500","published_count":1},"entities":null,"annotator_type":"User","annotator_id":5,"annotation_type":"report_design","updated_at":"2022-07-15T15:37:37.933Z","annotated_type":"ProjectMedia","annotated_id":201,"file":null,"version_index":null,"created_at":"2022-07-01T21:17:23.347Z","attribution":null,"lock_version":0,"locked":false,"fragment":null}',
  object_changes_json: '{"data":[{"state": "unpublished"}, {"state": "published"}]}',
  meta: null,
  annotation: {
    id: 'QW5ub3RhdGlvbi8xNzY2\n',
    dbid: '1766',
    content: '{"options":[{"language":"en","use_text_message":true,"use_introduction":true,"introduction":"blo","status_label":"Inconclusive","theme_color":"#9e9e9e","image":"","title":"blabla","headline":"blabla","text":"the blabla doesn\'t exist","description":"the blabla doesn\'t exist","published_article_url":"https://lol.com/blabla","previous_published_status_label":"Inconclusive"}],"state":"paused","last_published":"1657718501","first_published":"1656710500","published_count":1}',
    annotation_type: 'report_design',
    updated_at: '1657904614',
    created_at: '1656710243',
    permissions: '{"read Dynamic":true,"update Dynamic":true,"destroy Dynamic":true}',
    annotator: {
      name: 'Test User',
      profile_image: 'http://bliblo.com/images/avatar',
      id: 'QW5ub3RhdG9yLzU=\n',
    },
    version: null,
  },
};

const annotationMultiSelect = {
  ...annotation,
  task: {
    type: 'multiple_choice',
    fieldset: 'metadata',
  },
  event_type: 'create_dynamicannotationfield',
  object_after: '{"id":123456,"annotation_id":2923453,"field_name":"response_multiple_choice","annotation_type":"task_response_multiple_choice","field_type":"select","value":""}',
};

describe('<Annotation />', () => {
  it('Renders report published event', () => {
    const wrapper = mountWithIntl((
      <Annotation
        annotation={annotation}
        team={{}}
      />
    ));
    expect(wrapper.find('.annotation__default').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.test-annotation__default-content').hostNodes().html()).toMatch('Fact-check published by');
  });

  it('Should not crash when rendering malformed multi select annotation response', () => {
    const wrapper = mountWithIntl((
      <Annotation
        annotation={annotationMultiSelect}
        team={{}}
      />
    ));

    expect(wrapper.find('.annotation__metadata-filled').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.annotation__metadata-filled').hostNodes().html()).toMatch('edited by');
  });
});
