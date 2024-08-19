import React from 'react';
import EditStatusDialog from './EditStatusDialog';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

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
    style: { color: 'var(--color-gray-15)' },
    label: 'True',
    should_send_message: true,
  };

  it('should render "Add a new status" title when do not pass status', () => {
    const wrapper = mountWithIntl(<EditStatusDialog
      defaultLanguage="English"
      open
      team={team}
      onCancel={() => {}}
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).toMatch('Add a new status');
    expect(wrapper.html()).not.toMatch('Edit status');
  });

  it('should render "Edit status" title when pass status', () => {
    const wrapper = mountWithIntl(<EditStatusDialog
      defaultLanguage="en"
      defaultValue={status}
      open={Boolean(status)}
      status={status}
      team={team}
      onCancel={() => {}}
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).not.toMatch('Add a new status');
    expect(wrapper.html()).not.toMatch('Send a message to the user who requested the item when you change an item to this status');
    expect(wrapper.html()).toMatch('Edit status');
    expect(wrapper.html()).toMatch('True');
    expect(wrapper.html()).toMatch('description A');
    expect(wrapper.find('#edit-status-dialog__status-message').hostNodes()).toHaveLength(0);
  });

  it('should render message field when smooch is installed on the team', () => {
    const wrapper = mountWithIntl(<EditStatusDialog
      defaultLanguage="en"
      defaultValue={status}
      open={Boolean(status)}
      team={team2}
      onCancel={() => {}}
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).not.toMatch('Add a new status');
    expect(wrapper.html()).toMatch('Edit status');
    expect(wrapper.html()).toMatch('True');
    expect(wrapper.html()).toMatch('Send a message to the user who requested the item when you change an item to this status');
    expect(wrapper.find('#edit-status-dialog__status-message').hostNodes()).toHaveLength(1);
  });

  it('should call handleConfirmSubmit function when submitting dialog and smooch is installed on the team', () => {
    const handleConfirmSubmit = jest.fn();
    const handleSubmit = jest.fn();
    const wrapper = mountWithIntl(<EditStatusDialog
      defaultLanguage="en"
      defaultValue={status}
      open={Boolean(status)}
      team={team2}
      onCancel={() => {}}
      onSubmit={team2.smooch_bot ? handleConfirmSubmit : handleSubmit}
    />);
    wrapper.find('button.edit-status-dialog__submit').hostNodes().simulate('click');
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(handleConfirmSubmit).toHaveBeenCalled();
  });

  it('should not call handleConfirmSubmit function when submitting dialog and smooch is not installed on the team', () => {
    const handleConfirmSubmit = jest.fn();
    const handleSubmit = jest.fn();
    const wrapper = mountWithIntl(<EditStatusDialog
      defaultLanguage="en"
      defaultValue={status}
      open={Boolean(status)}
      team={team}
      onCancel={() => {}}
      onSubmit={team.smooch_bot ? handleConfirmSubmit : handleSubmit}
    />);
    wrapper.find('button.edit-status-dialog__submit').hostNodes().simulate('click');
    expect(handleSubmit).toHaveBeenCalled();
    expect(handleConfirmSubmit).not.toHaveBeenCalled();
  });
});
