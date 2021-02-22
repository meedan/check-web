
import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import StatusesComponent from './StatusesComponent';

const statuses = [
  {
    id: '1',
    label: 'Undetermined',
    locales: { pt: { label: 'Undetermined' } },
    style: { color: 'black' },
  },
  {
    id: '2',
    label: 'In Progress',
    locales: { en: { label: 'In Progress' } },
    style: { color: 'black' },
  },
  {
    id: '3',
    label: 'True',
    locales: { en: { label: 'True' } },
    style: { color: 'black' },
  },
];

const verification_statuses = {
  active: 'in_progress',
  default: 'undertemined',
  label: 'Status',
  statuses,
};

const team = {
  slug: 'new-team',
  id: '1',
  team_bot_installations: {
    edges: [],
  },
  verification_statuses,
  verification_statuses_with_counters: verification_statuses,
  get_language: 'en',
  get_languages: '["en","pt","es"]',
};

describe('<StatusesComponent/>', () => {
  it('should render statuses and languages', () => {
    const wrapper = mountWithIntl(<StatusesComponent
      team={team}
    />);
    expect(wrapper.find('.status-actions__menu').hostNodes()).toHaveLength(3);
    // languages
    expect(wrapper.text()).toMatch('English(default)');
    expect(wrapper.html()).toMatch('Português');
    expect(wrapper.html()).toMatch('Español');
    // statuses
    expect(wrapper.html()).toMatch('English statuses');
    expect(wrapper.html()).toMatch('Undetermined');
    expect(wrapper.html()).toMatch('True');
    expect(wrapper.html()).toMatch('In Progress');
    expect(wrapper.html()).toMatch('New status');
  });
});

