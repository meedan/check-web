import React from 'react';
import { SmoochBotResourceEditorComponent } from './SmoochBotResourceEditor';
import { shallowWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<SmoochBotResourceEditorComponent />', () => {
  const resource = {
    id: 'VGlwbGluZVJlc291cmNlLzEK',
    dbid: 1,
    uuid: '12345678',
    title: 'Test',
    header_file_url: null,
    header_type: 'none',
  };

  const props = {
    environment: {},
    team: {
      slug: 'test',
    },
    language: 'en',
    resource,
    onCreate: () => {},
    onDelete: () => {},
  };

  it('renders resource correctly', () => {
    const resourceEditor = shallowWithIntl(<SmoochBotResourceEditorComponent {...props} />);
    expect(resourceEditor.find('div#resource-1')).toHaveLength(1);
  });

  it('renders static resource correctly', () => {
    const resourceEditor = shallowWithIntl(<SmoochBotResourceEditorComponent {...props} resource={{ ...resource, content_type: 'static' }} />);
    expect(resourceEditor.find('NewsletterRssFeed')).toHaveLength(0);
  });

  it('renders dynamic resource correctly', () => {
    const resourceEditor = shallowWithIntl(<SmoochBotResourceEditorComponent {...props} resource={{ ...resource, content_type: 'rss' }} />);
    expect(resourceEditor.find('NewsletterRssFeed')).toHaveLength(1);
  });

  it('renders delete button for existing resource', () => {
    const resourceEditor = shallowWithIntl(<SmoochBotResourceEditorComponent {...props} />);
    expect(resourceEditor.find('.int-resource__delete-button')).toHaveLength(1);
  });

  it('renders no delete button for new resource', () => {
    const resourceEditor = shallowWithIntl(<SmoochBotResourceEditorComponent {...props} resource={{ ...resource, id: null }} />);
    expect(resourceEditor.find('.int-resource__delete-button')).toHaveLength(0);
  });
});
