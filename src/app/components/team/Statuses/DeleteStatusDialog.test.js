import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import DeleteStatusDialog from './DeleteStatusDialog';

describe('<DeleteStatusDialog />', () => {
  const statuses = [
    {
      id: '1',
      label: 'False',
      items_count: 4,
    },
    {
      id: '2',
      label: 'In Progress',
      items_count: 5,
      published_reports_count: 3,
    },
    {
      id: '3',
      label: 'True',
      items_count: 1,
    },
  ];

  it('should display the status to be deleted and show the message that one item is using this status', () => {
    const wrapper = mountWithIntl(<DeleteStatusDialog
      defaultValue={statuses[2]}
      onCancel={() => {}}
      onProceed={() => {}}
      handleSelect={() => {}}
      open
      statuses={statuses}
    />);
    expect(wrapper.html()).toMatch('You need to change the status of one item to delete this status');
    expect(wrapper.html()).not.toMatch('Alternatively, you can change each item status individually');
    expect(wrapper.html()).toMatch('True');
    expect(wrapper.find('.confirm-proceed-dialog__cancel').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('Move items and delete status');
  });

  it('should display message that four items are using the status', () => {
    const wrapper = mountWithIntl(<DeleteStatusDialog
      defaultValue={statuses[0]}
      onCancel={() => {}}
      onProceed={() => {}}
      handleSelect={() => {}}
      open
      statuses={statuses}
    />);
    expect(wrapper.html()).toMatch('There are 4 items with the status');
    expect(wrapper.html()).toMatch('False');
    expect(wrapper.find('.confirm-proceed-dialog__cancel').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('Move items and delete status');
    expect(wrapper.html()).not.toMatch('those items are currently published');
  });

  it('should display the published items using this status', () => {
    const wrapper = mountWithIntl(<DeleteStatusDialog
      defaultValue={statuses[1]}
      onCancel={() => {}}
      onProceed={() => {}}
      handleSelect={() => {}}
      open
      statuses={statuses}
    />);
    expect(wrapper.html()).toMatch('There are 5 items with the status');
    expect(wrapper.html()).toMatch('In Progress');
    expect(wrapper.html()).toMatch('3 items are currently published');
    expect(wrapper.find('.confirm-proceed-dialog__cancel').hostNodes()).toHaveLength(1);
  });

  it('should not display published message when there is no item published', () => {
    const wrapper = mountWithIntl(<DeleteStatusDialog
      defaultValue={statuses[0]}
      onCancel={() => {}}
      onProceed={() => {}}
      handleSelect={() => {}}
      open
      statuses={statuses}
    />);
    expect(wrapper.html()).toMatch('There are 4 items with the status');
    expect(wrapper.html()).not.toMatch('items are currently published');
  });
});
