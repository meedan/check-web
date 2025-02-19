
import React from 'react';
import { StatusesComponent } from './StatusesComponent';
import StatusListItem from './StatusListItem';
import { shallowWithIntl } from '../../../../../test/unit/helpers/intl-test';

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
  smooch_bot: null,
  verification_statuses,
  verification_statuses_with_counters: verification_statuses,
  get_language: 'en',
  get_languages: '["en","pt","es"]',
};

describe('<StatusesComponent/>', () => {
  it('should render statuses', () => {
    const wrapper = shallowWithIntl(<StatusesComponent
      setFlashMessage={() => {}}
      team={team}
    />);
    const statusItems = wrapper.find(StatusListItem);
    expect(statusItems).toHaveLength(3);
    statusItems.forEach((item) => {
      expect(item.prop('defaultLanguage')).toEqual('en');
    });
  });
});

