import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import TimelineWidget from '../cds/charts/TimelineWidget';

const TimelineTiplineMessageVolume = ({ statistics }) => (
  <TimelineWidget
    data={
      Object.entries(statistics.number_of_conversations_by_date).map(([date, value]) => ({ date, value }))
    }
    title={
      <FormattedMessage
        defaultMessage="Tipline Message Volume"
        description="Title for the tipline message volume widget"
        id="timelineTiplineMessageVolume.title"
      />
    }
  />
);

TimelineTiplineMessageVolume.propTypes = {
  statistics: PropTypes.shape({
    number_of_conversations_by_date: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(TimelineTiplineMessageVolume, graphql`
  fragment TimelineTiplineMessageVolume_statistics on TeamStatistics {
    number_of_conversations_by_date
  }
`);
