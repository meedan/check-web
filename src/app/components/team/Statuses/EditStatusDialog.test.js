import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import EditStatusDialog from './EditStatusDialog';

describe('<EditStatusDialog />', () => {
  const team = {
    slug: 'new-team',
    id: '1',
    smooch_bot: null,
  };

  const team2 = {
    slug: 'new-team',
    id: '1',
    smooch_bot: {
      id: '1',
    },
  };

  const status = {
    id: '1',
    locales: {
      en: { label: 'True', description: 'description A', message: 'message to be sent' },
    },
    style: { color: 'black' },
    label: 'True',
    should_send_message: true,
  };

  it('should render "Add a new status" title when do not pass status', () => {
    const wrapper = mountWithIntl(<EditStatusDialog
      open
      team={team}
      defaultLanguage="English"
      onCancel={() => {}}
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).toMatch('Add a new status');
    expect(wrapper.html()).not.toMatch('Edit status');
  });


  it('should render "Edit status" title when pass status', () => {
    const wrapper = mountWithIntl(<EditStatusDialog
      status={status}
      team={team}
      defaultLanguage="en"
      defaultValue={status}
      open={Boolean(status)}
      onCancel={() => {}}
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).not.toMatch('Add a new status');
    expect(wrapper.html()).not.toMatch('Send a message to the user who requested the item when you change an item to this status');
    expect(wrapper.html()).toMatch('Edit status');
    expect(wrapper.html()).toMatch('True');
    expect(wrapper.html()).toMatch('description A');
    expect(wrapper.find('#edit-status-dialog__status-message-label').hostNodes()).toHaveLength(0);
  });


  it('should render message field when smooch is installed on the team', () => {
    const wrapper = mountWithIntl(<EditStatusDialog
      team={team2}
      defaultLanguage="en"
      defaultValue={status}
      open={Boolean(status)}
      onCancel={() => {}}
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).not.toMatch('Add a new status');
    expect(wrapper.html()).toMatch('Edit status');
    expect(wrapper.html()).toMatch('True');
    expect(wrapper.html()).toMatch('Send a message to the user who requested the item when you change an item to this status');
    expect(wrapper.find('#edit-status-dialog__status-message-label').hostNodes()).toHaveLength(1);
  });
});
