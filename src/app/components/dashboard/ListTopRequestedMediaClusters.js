import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';

const ListTopRequestedMediaClusters = ({ statistics }) => (
  <ListWidget
    emptyText={
      <FormattedMessage
        defaultMessage="No media clusters"
        description="Text to display when there are no media clusters"
        id="listTopRequestedMediaClusters.emptyText"
      />
    }
    items={
      Object.entries(statistics.top_requested_media_clusters).map(([itemText, itemValue]) => ({ itemText, itemValue }))
    }
    title={
      <FormattedMessage
        defaultMessage="Top Requested Media Clusters"
        description="Title for the top requested media clusters list widget"
        id="listTopRequestedMediaClusters.title"
      />
    }
  />
);

ListTopRequestedMediaClusters.propTypes = {
  statistics: PropTypes.shape({
    top_requested_media_clusters: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(ListTopRequestedMediaClusters, graphql`
  fragment ListTopRequestedMediaClusters_statistics on TeamStatistics {
    top_requested_media_clusters
  }
`);
