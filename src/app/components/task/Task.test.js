import React from 'react';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import { TaskComponentTest } from './Task';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import { MetadataText, MetadataFile, MetadataDate, MetadataNumber, MetadataLocation, MetadataMultiselect, MetadataUrl } from '@meedan/check-ui';
import { json } from 'express';
import { mount } from 'enzyme';
import { Map } from 'react-leaflet';

const permissions = JSON.stringify({
  'create Media': true, 'create ClaimDescription': true, 'read Dynamic': true, 'update Dynamic': true,
});

const task_free_text = {
  type: 'free_text',
  dbid: 'das',
  assignments: { edges: [] },
  responses: {
    edges: [{
      node: {
        id: '11', dbid: 11, permissions, content: 'text content', file_data: null,
      },
    }],
  },
  team_task: { required: false },
  team_task_id: 14,
  id: '1',
  label: 'title',
  annotated_type: 'ProjectMedia',
  permissions,
  description: null,
  fieldset: 'metadata',
  first_response_value: 'first text content',
  first_response: 'first text content',
};

const task_number = {
  type: 'number',
  dbid: 'das',
  assignments: { edges: [] },
  responses: {
    edges: [{
      node: {
        id: '11', dbid: 11, permissions, content: 'text content', file_data: null,
      },
    }],
  },
  team_task: { required: false },
  team_task_id: 14,
  id: '1',
  label: 'title',
  annotated_type: 'ProjectMedia',
  permissions,
  description: null,
  fieldset: 'metadata',
  first_response_value: 'first response value',
  first_response: 'first response value',
};

const task_upload_file = {
  type: 'file_upload',
  dbid: 'das',
  assignments: { edges: [] },
  responses: {
    edges: [{
      node: {
        id: '11', dbid: 11, permissions, content: 'text content', file_data: null,
      },
    }],
  },
  team_task: { required: false },
  team_task_id: 14,
  id: '1',
  label: 'title',
  annotated_type: 'ProjectMedia',
  permissions,
  description: null,
  fieldset: 'metadata',
  first_response_value: 'first response value',
  first_response: 'first response value',
};

const task_url = {
  type: 'url',
  dbid: 'das',
  assignments: { edges: [] },
  responses: {
    edges: [{
      node: {
        id: '11', dbid: 11, permissions, content: 'text content', file_data: null,
      },
    }],
  },
  team_task: { required: false },
  team_task_id: 14,
  id: '1',
  label: 'title',
  annotated_type: 'ProjectMedia',
  permissions,
  description: null,
  fieldset: 'metadata',
  first_response_value: 'first response value',
  first_response: 'first response value',
};

const task_multiple_choice = {
  type: 'multiple_choice',
  dbid: 'das',
  assignments: { edges: [] },
  responses: {
    edges: [{
      node: {
        id: '11', dbid: 11, permissions, content: 'text content', file_data: null,
      },
    }],
  },
  team_task: { required: false },
  team_task_id: 14,
  id: '1',
  label: 'title',
  annotated_type: 'ProjectMedia',
  permissions,
  description: null,
  fieldset: 'metadata',
  first_response_value: 'first response value',
  first_response: 'first response value',
  options: [{ label: 'aaa' }, { label: 'bbb' }],
};

const task_single_choice = {
  type: 'single_choice',
  dbid: 'das',
  assignments: { edges: [] },
  responses: {
    edges: [{
      node: {
        id: '11', dbid: 11, permissions, content: 'text content', file_data: null,
      },
    }],
  },
  team_task: { required: false },
  team_task_id: 14,
  id: '1',
  label: 'title',
  annotated_type: 'ProjectMedia',
  permissions,
  description: null,
  fieldset: 'metadata',
  first_response_value: 'first response value',
  first_response: 'first response value',
  options: [{ label: 'aaa' }, { label: 'bbb' }],
};

const task_datetime = {
  type: 'datetime',
  dbid: 'das',
  assignments: { edges: [] },
  responses: {
    edges: [{
      node: {
        id: '11', dbid: 11, permissions, content: 'text content', file_data: null,
      },
    }],
  },
  team_task: { required: false },
  team_task_id: 14,
  id: '1',
  label: 'title',
  annotated_type: 'ProjectMedia',
  permissions,
  description: null,
  fieldset: 'metadata',
  first_response_value: 'first response value',
  first_response: 'first response value',
};

const content = [{
  id: 504, annotation_id: 427, field_name: 'response_geolocation', annotation_type: 'task_response_geolocation', field_type: 'geojson', value: { type: 'Feature', geometry: { type: 'Point', coordinates: '[-12.9822,-38.4813]' }, properties: { name: 'Salvador, Bahia, Brazil' } }, value_json: { type: 'Feature', geometry: { type: 'Point', coordinates: [-12.9822, -38.4813] }, properties: { name: 'Salvador, Bahia, Brazil' } }, created_at: '2022-08-03T11:49:07.023Z', updated_at: '2022-08-03T', formatted_value: 'Salvador, Bahia, Brazil (-12.9822, -38.4813)',
}];

const task_geolocation = {
  type: 'geolocation',
  dbid: 'das',
  assignments: { edges: [] },
  responses: {
    edges: [{
      node: {
        id: '11', dbid: 11, permissions, content, file_data: null,
      },
    }],
  },
  team_task: { required: false },
  team_task_id: 14,
  id: '1',
  label: 'title',
  annotated_type: 'ProjectMedia',
  permissions,
  description: null,
  fieldset: 'metadata',
  first_response_value: '',
  first_response: 'Salvador, Bahia, Brazil (-12.9822, -38.4813)',
  content,
  geolocations: { edges: [] },
};

const media = {
  archived: CheckArchivedFlags.NONE,
  permissions,
  url: null,
  quote: 'test',
  title: 'test',
  metadata: { title: 'Title' },
};

describe('<Task />', () => {
  it('should render MetadataText when task type is free text', () => {
    const wrapper = shallowWithIntl(<TaskComponentTest
      task={task_free_text}
      media={media}
      about={{}}
      isEditing={false}
    />);
    expect(wrapper.find(MetadataText)).toHaveLength(1);
  });

  it('should render MetadataNumber when task type is file_upload', () => {
    const wrapper = shallowWithIntl(<TaskComponentTest
      task={task_number}
      media={media}
      about={{}}
      isEditing={false}
    />);
    expect(wrapper.find(MetadataNumber)).toHaveLength(1);
  });

  it('should render MetadataFile when task type is file_upload', () => {
    const wrapper = shallowWithIntl(<TaskComponentTest
      task={task_upload_file}
      media={media}
      about={{}}
      isEditing
    />);
    expect(wrapper.find(MetadataFile)).toHaveLength(1);
  });

  it('should render MetadataUrl when task type is url', () => {
    const wrapper = shallowWithIntl(<TaskComponentTest
      task={task_url}
      media={media}
      about={{}}
      isEditing
    />);
    expect(wrapper.find(MetadataUrl)).toHaveLength(1);
  });

  it('should render MetadataDate when task type is file_upload', () => {
    const wrapper = shallowWithIntl(<TaskComponentTest
      task={task_datetime}
      media={media}
      about={{}}
      isEditing
    />);
    expect(wrapper.find(MetadataDate)).toHaveLength(1);
  });

  it('should render MetadataMultiselect when task type is multiple_choice', () => {
    const wrapper = shallowWithIntl(<TaskComponentTest
      task={task_multiple_choice}
      media={media}
      about={{}}
      isEditing
    />);
    expect(wrapper.find(MetadataMultiselect)).toHaveLength(1);
  });

  it('should render MetadataMultiselect when task type is single_choice', () => {
    const wrapper = shallowWithIntl(<TaskComponentTest
      task={task_single_choice}
      media={media}
      about={{}}
      isEditing
    />);
    expect(wrapper.find(MetadataMultiselect)).toHaveLength(1);
  });

  it('should render MetadataLocation when task type is geolocation', () => {
    const wrapper = shallowWithIntl(<TaskComponentTest
      task={task_geolocation}
      media={media}
      about={{}}
      isEditing
    />);
    expect(wrapper.find(MetadataLocation)).toHaveLength(1);
  });
});
