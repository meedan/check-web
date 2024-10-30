import React from 'react';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import ListWidget from '../cds/charts/ListWidget';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TagIcon from '../../icons/local_offer.svg';

const ListTopArticlesTags = ({ statistics }) => {
  const dataArray = Object.entries(statistics.top_articles_tags).map(([itemText, itemValue]) => ({ itemText, itemValue }));

  const teamSlug = window.location.pathname.split('/')[1];

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
          defaultMessage="No article tags"
          description="Text to display when there are no article tags"
          id="listTopArticlesTags.emptyText"
        />
      }
      items={dataArray}
      title={
        <FormattedMessage
          defaultMessage="Top Article Tags"
          description="Title for the top article tags list widget"
          id="listTopArticlesTags.title"
        />
      }
    />
  );
};

ListTopArticlesTags.propTypes = {
  statistics: PropTypes.shape({
    top_articles_tags: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(ListTopArticlesTags, graphql`
  fragment ListTopArticlesTags_statistics on TeamStatistics {
    top_articles_tags
  }
`);
