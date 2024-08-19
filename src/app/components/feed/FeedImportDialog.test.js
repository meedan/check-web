import React from 'react';
import { FeedImportDialog } from './FeedImportDialog';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<FeedImportDialog />', () => {
  const team = {
    dbid: 1,
  };

  const feed = {
    dbid: 2,
  };

  const cluster = {
    media_count: 10,
    center: {
      dbid: 3,
    },
    project_medias: {
      edges: [],
    },
  };

  it('should render dialog', () => {
    const wrapper = shallowWithIntl(<FeedImportDialog cluster={cluster} feed={feed} setFlashMessage={() => {}} team={team} />);
    expect(wrapper.find('#feed-import-dialog')).toHaveLength(1);
  });

  it('should render dialog with import mode "search" if workspace is not contributing to cluster', () => {
    const wrapper = shallowWithIntl(<FeedImportDialog cluster={cluster} feed={feed} setFlashMessage={() => {}} team={team} />);
    expect(wrapper.find('#feed-import-dialog__add')).toHaveLength(0);
    expect(wrapper.find('#feed-import-dialog__create')).toHaveLength(0);
    expect(wrapper.find('#feed-import-dialog__search')).toHaveLength(1);
  });

  it('should render dialog with import mode "add" if workspace is contributing to cluster', () => {
    const clusterWithItem = {
      ...cluster,
      project_medias: {
        edges: [
          {
            node: {
              dbid: 4,
            },
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<FeedImportDialog cluster={clusterWithItem} feed={feed} setFlashMessage={() => {}} team={team} />);
    expect(wrapper.find('#feed-import-dialog__add')).toHaveLength(1);
    expect(wrapper.find('#feed-import-dialog__create')).toHaveLength(0);
    expect(wrapper.find('#feed-import-dialog__search')).toHaveLength(0);
  });
});
