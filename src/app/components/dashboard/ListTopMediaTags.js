import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';

const ListTopMediaTags = ({ statistics }) => (
  <ListWidget
    items={
      Object.entries(statistics.top_media_tags).map(([itemText, itemValue]) => ({ itemText, itemValue }))
    }
    title={
      <FormattedMessage
        defaultMessage="Top Media Tags"
        description="Title for the top media tags list widget"
        id="listTopMediaTags.title"
      />
    }
  />
);

ListTopMediaTags.propTypes = {
  statistics: PropTypes.shape({
    top_media_tags: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(ListTopMediaTags, graphql`
  fragment ListTopMediaTags_statistics on TeamStatistics {
    top_media_tags
  }
`);
