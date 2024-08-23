import React from 'react';
import ReportDesignerTopBar from './ReportDesignerTopBar';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<ReportDesignerTopBar />', () => {
  const team = {
    dbid: 123,
    name: 'new-team',
    slug: 'new-team',
    pusher_channel: 'pusher',
    verification_statuses: {
      statuses: [
        {
          description: 'Default, just added, no work has started',
          id: 'undetermined',
          label: 'Unstarted',
          style: {
            backgroundColor: 'var(--color-blue-54)',
            color: 'var(--color-blue-54)',
          },
        },
      ],
    },
  };
  const media = {
    metadata: {
      title: 'Title',
    },
    overridden: {},
    last_status: 'undetermined',
    last_status_obj: {
      locked: false,
    },
    permissions: JSON.stringify({}),
    project_id: 1,
    media: {
      url: 'http://meedan.com',
      quote: '',
      metadata: { title: 'Title' },
    },
    team,
    data: {
      title: 'Title',
    },
  };

  it('should render a published report', () => {
    const wrapper = mountWithIntl(<ReportDesignerTopBar
      data={{
        options: [],
      }}
      defaultLanguage="en"
      media={media}
      prefixUrl="prefix"
      readOnly
      state="published"
      onStateChange={() => {}}
      onStatusChange={() => {}}
    />);
    expect(wrapper.find('ReportDesignerConfirmableButton').text()).toBe('Pause');
    expect(wrapper.find('MediaStatus > MediaStatus').text()).toBe('Unstarted');
  });

  it('should render a paused report', () => {
    const wrapper = mountWithIntl(<ReportDesignerTopBar
      data={{
        options: [],
      }}
      defaultLanguage="en"
      media={media}
      prefixUrl="prefix"
      state="paused"
      onStateChange={() => {}}
      onStatusChange={() => {}}
    />);
    expect(wrapper.find('ReportDesignerConfirmableButton').text()).toBe('Publish');
  });
});
