import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import TimelineWidget from '../cds/charts/TimelineWidget';

const TimelineArticlesCreatedAndUpdated = ({ statistics }) => {
  console.log('TimelineArticlesCreatedAndUpdated statistics:', statistics.number_of_articles_created); // eslint-disable-line no-console
  console.log('TimelineArticlesCreatedAndUpdated statistics:', statistics.number_of_articles_updated); // eslint-disable-line no-console

  return (
    <TimelineWidget
      data={
        Object.entries(statistics.number_of_articles_created).map(([date, value]) => ({ date, value }))
      }
      title="Articles Added & Updated"
    />
  );
};

export default createFragmentContainer(TimelineArticlesCreatedAndUpdated, graphql`
  fragment TimelineArticlesCreatedAndUpdated_statistics on TeamStatistics {
    number_of_articles_created
    number_of_articles_updated
  }
`);
