import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import ReportDesignerTopBar from './ReportDesignerTopBar';

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
            backgroundColor: 'var(--brandMain)',
            color: 'var(--brandMain)',
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
      state="published"
      media={media}
      data={{
        options: [],
      }}
      defaultLanguage="en"
      onStatusChange={() => {}}
      onStateChange={() => {}}
      readOnly
      prefixUrl="prefix"
    />);
    expect(wrapper.find('ReportDesignerConfirmableButton').text()).toBe('Pause');
    expect(wrapper.find('MediaStatus > MediaStatus').text()).toBe('Unstarted');
  });

  it('should render a paused report', () => {
    const wrapper = mountWithIntl(<ReportDesignerTopBar
      state="paused"
      media={media}
      data={{
        options: [],
      }}
      defaultLanguage="en"
      onStatusChange={() => {}}
      onStateChange={() => {}}
      prefixUrl="prefix"
    />);
    expect(wrapper.find('ReportDesignerConfirmableButton').text()).toBe('Publish');
  });
});
