import React from 'react';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import { urlFromSearchQuery } from '../search/Search';
import TagIcon from '../../icons/local_offer.svg';

const ListTopMediaTags = ({ statistics }) => {
  const teamSlug = window.location.pathname.split('/')[1];

  const dataArray = statistics.top_media_tags.map(t => ({
    itemText: t.label,
    itemValue: t.value,
    itemLink: urlFromSearchQuery({ tags: [t.label] }, `/${teamSlug}/all-items`),
  }));

  return (
    <ListWidget
      actionButton={
        <ButtonMain
          iconLeft={<TagIcon />}
          label={
            <FormattedMessage
              defaultMessage="Manage Tags"
              description="Label for the button to manage tags"
              id="listTopMediaTags.manageTags"
            />
          }
          size="small"
          theme="beige"
          variant="contained"
          onClick={() => browserHistory.push(`/${teamSlug}/settings/tags`)}
        />
      }
      emptyText={
        <FormattedMessage
          defaultMessage="No media tags"
          description="Text to display when there are no media tags"
          id="listTopMediaTags.emptyText"
        />
      }
      items={dataArray}
      title={
        <FormattedMessage
          defaultMessage="Top Media Cluster Tags"
          description="Title for the top media cluster tags list widget"
          id="listTopMediaTags.title"
        />
      }
    />
  );
};

ListTopMediaTags.propTypes = {
  statistics: PropTypes.shape({
    top_media_tags: PropTypes.array.isRequired,
  }).isRequired,
};

export default createFragmentContainer(ListTopMediaTags, graphql`
  fragment ListTopMediaTags_statistics on TeamStatistics {
    top_media_tags
  }
`);
