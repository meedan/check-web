import React from 'react';
import { SearchKeywordTest } from './SearchKeyword';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

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
        subscribe: () => () => null,
        unsubscribe: () => {},
      }}
      project={project}
      query={{
        keyword: 'search keyword',
      }}
      clientSessionId=""
      setStateQuery={() => {}}
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
        subscribe: () => () => null,
        unsubscribe: () => {},
      }}
      project={project}
      query={{}}
      clientSessionId=""
      setStateQuery={() => {}}
      cleanupQuery={() => {}}
      handleSubmit={() => {}}
    />);

    expect(wrapper.find('PageTitle').props().prefix).toBe('project-title');
  });
});

