import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import StatusListItem from './StatusListItem';

const status = {
  id: '1',
  locales: {
    pt: { label: 'true', description: 'description x', message: 'message to be sent' },
  },
  style: { color: 'black' },
  label: 'true',
  should_send_message: true,
};

const status2 = {
  id: '2',
  locales: {
    eng: { label: 'false' },
  },
  style: { color: 'black' },
  label: 'false',
};

describe('<StatusListItem/>', () => {
  it('should render status item', () => {
    const wrapper = mountWithIntl(<StatusListItem
      defaultLanguage="pt"
      onDelete={() => {}}
      onEdit={() => {}}
      onMakeDefault={() => {}}
      status={status}
      isDefault
      label
      key={status.id}
    />);
    expect(wrapper.html()).toMatch('true');
    expect(wrapper.html()).toMatch('description x');
    expect(wrapper.html()).not.toMatch('No description');
    expect(wrapper.html()).toMatch('(default)');
    expect(wrapper.html()).toMatch('message to be sent');
    expect(wrapper.find('.status-actions__menu').hostNodes()).toHaveLength(1);
  });

  it('should display status item with no description', () => {
    const wrapper = mountWithIntl(<StatusListItem
      defaultLanguage="en"
      onDelete={() => {}}
      onEdit={() => {}}
      onMakeDefault={() => {}}
      status={status2}
      key={status.id}
    />);
    expect(wrapper.html()).toMatch('false');
    expect(wrapper.html()).not.toMatch('(default)');
    expect(wrapper.html()).toMatch('No description');
    expect(wrapper.find('.status-actions__menu').hostNodes()).toHaveLength(1);
  });
});
