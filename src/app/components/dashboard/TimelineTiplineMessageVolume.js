import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import TimelineWidget from '../cds/charts/TimelineWidget';

const TimelineTiplineMessageVolume = ({ statistics }) => (
  <TimelineWidget
    data={
      Object.entries(statistics.number_of_conversations_by_date).map(([date, value]) => ({ date, value }))
    }
    title="Tipline Message Volume"
  />
);

export default createFragmentContainer(TimelineTiplineMessageVolume, graphql`
  fragment TimelineTiplineMessageVolume_statistics on TeamStatistics {
    number_of_conversations_by_date
  }
`);
