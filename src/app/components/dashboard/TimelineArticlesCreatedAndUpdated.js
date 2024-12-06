import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import TimelineWidget from '../cds/charts/TimelineWidget';

const TimelineArticlesCreatedAndUpdated = ({ statistics }) => (
  <TimelineWidget
    data={
      Object.entries(statistics.number_of_articles_created_by_date).map(([date, value]) => ({
        date: `${date}T23:59:59.000Z`,
        value,
        updatedValue: statistics.number_of_articles_updated_by_date[date],
      }))
    }
    title={
      <FormattedMessage
        defaultMessage="Articles Added & Updated"
        description="Title for the number of articles added and updated timeline widget"
        id="timelineArticlesCreatedAndUpdated.title"
      />
    }
    tooltipFormatter={(value, name, props) => [(
      <>
        <div>
          <FormattedMessage
            defaultMessage="• {articleCount} Articles Added"
            description="Tooltip for the articles created and updated widget"
            id="timelineArticlesCreatedAndUpdated.created"
            values={{ articleCount: value }}
          />
        </div>
        <div>
          <FormattedMessage
            defaultMessage="• {articleCount} Articles Updated"
            description="Tooltip for the articles created and updated widget"
            id="timelineArticlesCreatedAndUpdated.updated"
            values={{ articleCount: props.payload.updatedValue }}
          />
        </div>
      </>
    )]}
  />
);

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
