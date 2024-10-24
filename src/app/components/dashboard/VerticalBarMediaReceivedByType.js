import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import VerticalBarChartWidget from '../cds/charts/VerticalBarChartWidget';

const VerticalBarMediaReceivedByType = ({ statistics }) => (
  <VerticalBarChartWidget
    data={
      Object.entries(statistics.number_of_media_received_by_type).map(([name, value]) => ({ name, value }))
    }
    title="Media Received"
  />
);

export default createFragmentContainer(VerticalBarMediaReceivedByType, graphql`
  fragment VerticalBarMediaReceivedByType_statistics on TeamStatistics {
    number_of_media_received_by_type
  }
`);
