import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import SearchResultsTable from './index';

describe('<SearchResultsTable />', () => {
  const columns = [
    {
      index: 1, key: 'share_count', label: 'FB Shares', show: true,
    },
    {
      index: 2, key: 'linked_items_count', label: 'Similar media', show: false,
    },
    {
      index: 3, key: 'created_at_timestamp', label: 'Submitted', show: false,
    },
  ];

  const team = {
    slug: 'new-team',
    id: '1',
    list_columns: columns,
    smooch_bot: null,
  };

  const projectMedias = [
    {
      __dataID__: '1',
      id: '1',
      dbid: 1,
      picture: '',
      show_warning_cover: false,
      title: 'Test title 1',
      description: 'Test description 1',
      is_read: true,
      is_main: true,
      is_secondary: false,
      report_status: 'unpublished',
      requests_count: 0,
      list_columns_values: {
        created_at_timestamp: 1646000000,
        share_count: 200,
        linked_items_count: 10,
      },
      source_id: null,
      cluster: null,
      project: {
        __dataID__: 'UHJvamVjdC8y\n',
        dbid: 2,
        id: 'UHJvamVjdC8y\n',
      },
    },
    {
      __dataID__: '2',
      id: '2',
      dbid: 2,
      picture: '',
      show_warning_cover: false,
      title: 'Test title 2',
      description: 'Test description 2',
      is_read: true,
      is_main: true,
      is_secondary: false,
      report_status: 'unpublished',
      requests_count: 0,
      list_columns_values: {
        created_at_timestamp: 1647000000,
        share_count: 200,
        linked_items_count: 10,
      },
      source_id: null,
      cluster: null,
      project: {
        __dataID__: 'UHJvamVjdC8y\n',
        dbid: 2,
        id: 'UHJvamVjdC8y\n',
      },
    },
  ];

  it('should render hidden/shown columns', () => {
    const wrapper = mountWithIntl(<SearchResultsTable
      onChangeSelectedIds={() => {}}
      onChangeSortParams={() => {}}
      buildProjectMediaUrl={() => {}}
      selectedIds={[]}
      projectMedias={projectMedias}
      team={team}
    />);
    // Use `render()` to get Cheerio object instead of Enzyme so we can run text() on multiple nodes
    const tableHeaders = wrapper.render().find('th');
    // "Submitted" must always be shown even if `.show` is false
    expect(tableHeaders.text()).toContain('Submitted');
    expect(tableHeaders.text()).not.toContain('Similar media');
    expect(tableHeaders.text()).toContain('FB Shares');
  });

  it('should render items in the order given by the API', () => {
    const wrapper = mountWithIntl(<SearchResultsTable
      onChangeSelectedIds={() => {}}
      onChangeSortParams={() => {}}
      buildProjectMediaUrl={() => {}}
      selectedIds={[]}
      projectMedias={projectMedias}
      team={team}
    />);
    expect(wrapper.find('tr').last().text()).toMatch('Test description 2');

    const wrapperSorted = mountWithIntl(<SearchResultsTable
      onChangeSelectedIds={() => {}}
      onChangeSortParams={() => {}}
      buildProjectMediaUrl={() => {}}
      selectedIds={[]}
      projectMedias={projectMedias.reverse()}
      team={team}
    />);
    expect(wrapperSorted.find('tr').last().text()).toMatch('Test description 1');
  });

  it('should render the sorting UX based on sort parameters', () => {
    const wrapperDescending = mountWithIntl(<SearchResultsTable
      onChangeSelectedIds={() => {}}
      onChangeSortParams={() => {}}
      buildProjectMediaUrl={() => {}}
      selectedIds={[]}
      projectMedias={projectMedias}
      sortParams={{ key: 'recent_added', ascending: false }}
      team={team}
    />);
    expect(wrapperDescending.find('[aria-sort="descending"]')).toHaveLength(1);
    expect(wrapperDescending.find('[aria-sort="ascending"]')).toHaveLength(0);

    const wrapperAscending = mountWithIntl(<SearchResultsTable
      onChangeSelectedIds={() => {}}
      onChangeSortParams={() => {}}
      buildProjectMediaUrl={() => {}}
      selectedIds={[]}
      projectMedias={projectMedias}
      sortParams={{ key: 'recent_added', ascending: true }}
      team={team}
    />);
    expect(wrapperAscending.find('[aria-sort="ascending"]')).toHaveLength(1);
    expect(wrapperAscending.find('[aria-sort="descending"]')).toHaveLength(0);
  });
});
