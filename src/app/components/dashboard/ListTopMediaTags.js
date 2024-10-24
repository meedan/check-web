import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';

const ListTopMediaTags = ({ statistics }) => (
  <ListWidget
    items={
      Object.entries(statistics.top_media_tags).map(([itemText, itemValue]) => ({ itemText, itemValue }))
    }
    title="Top Media Tags"
  />
);

export default createFragmentContainer(ListTopMediaTags, graphql`
  fragment ListTopMediaTags_statistics on TeamStatistics {
    top_media_tags
  }
`);
