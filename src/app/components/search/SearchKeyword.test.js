import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import { SearchKeywordTest } from './SearchKeyword';

describe('<SearchKeyword />', () => {
  const team = {
    dbid: 123,
    name: 'new-team',
    slug: 'new-team',
    pusher_channel: 'pusher',
    verification_statuses: {
      statuses: [{
        id: 'one',
        label: 'one',
      }],
    },
  };

  const project = {
    title: 'project-title',
  };

  it('should render with title set to initial keyword', () => {
    const wrapper = mountWithIntl(<SearchKeywordTest
      classes={{}}
      team={team}
      pusher={{
        subscribe: () => { return () => { return null;} },
        unsubscribe: () => {},
      }}
      project={{project}}
      query={{
        keyword: 'search keyword',
      }}
      clientSessionId=""
      setQuery={() => {}}
      cleanupQuery={() => {}}
      handleSubmit={() => {}}
    />);

    expect(wrapper.find('PageTitle').props().prefix).toBe('search keyword');
  });

  it('should render with title set to project title when no query keyword present', () => {
    const wrapper = mountWithIntl(<SearchKeywordTest
      classes={{}}
      team={team}
      pusher={{
        subscribe: () => { return () => { return null;} },
        unsubscribe: () => {},
      }}
      project={project}
      query={{}}
      clientSessionId=""
      setQuery={() => {}}
      cleanupQuery={() => {}}
      handleSubmit={() => {}}
    />);

    expect(wrapper.find('PageTitle').props().prefix).toBe('project-title');
  });
});

