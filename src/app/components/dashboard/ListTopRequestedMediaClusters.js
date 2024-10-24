import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';

const ListTopRequestedMediaClusters = ({ statistics }) => (
  <ListWidget
    items={
      Object.entries(statistics.top_requested_media_clusters).map(([itemText, itemValue]) => ({ itemText, itemValue }))
    }
    title="Top Requested Media Clusters"
  />
);

export default createFragmentContainer(ListTopRequestedMediaClusters, graphql`
  fragment ListTopRequestedMediaClusters_statistics on TeamStatistics {
    top_requested_media_clusters
  }
`);
