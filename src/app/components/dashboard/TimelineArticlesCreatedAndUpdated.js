import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import TimelineWidget from '../cds/charts/TimelineWidget';

const TimelineArticlesCreatedAndUpdated = ({ statistics }) => {
  //
  // TODO: Format tooltip to show both created and updated articles
  //

  console.log('TimelineArticlesCreatedAndUpdated statistics:', statistics.number_of_articles_created_by_date); // eslint-disable-line no-console
  console.log('TimelineArticlesCreatedAndUpdated statistics:', statistics.number_of_articles_updated_by_date); // eslint-disable-line no-console

  return (
    <TimelineWidget
      data={
        Object.entries(statistics.number_of_articles_created_by_date).map(([date, value]) => ({ date, value }))
      }
      title={
        <FormattedMessage
          defaultMessage="Articles Added & Updated"
          description="Title for the number of articles added and updated timeline widget"
          id="timelineArticlesCreatedAndUpdated.title"
        />
      }
    />
  );
};

TimelineArticlesCreatedAndUpdated.propTypes = {
  statistics: PropTypes.shape({
    number_of_articles_created_by_date: PropTypes.object.isRequired,
    number_of_articles_updated_by_date: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(TimelineArticlesCreatedAndUpdated, graphql`
  fragment TimelineArticlesCreatedAndUpdated_statistics on TeamStatistics {
    number_of_articles_created_by_date
    number_of_articles_updated_by_date
  }
`);
