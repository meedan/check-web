import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import VerticalBarChartWidget from '../cds/charts/VerticalBarChartWidget';

const VerticalBarMediaReceivedByType = ({ statistics }) => (
  <VerticalBarChartWidget
    data={
      Object.entries(statistics.number_of_media_received_by_type).map(([name, value]) => ({ name, value }))
    }
    title={
      <FormattedMessage
        defaultMessage="Media Received"
        description="Title for the number of media received by type widget"
        id="verticalBarMediaReceivedByType.title"
      />
    }
  />
);

VerticalBarMediaReceivedByType.propTypes = {
  statistics: PropTypes.shape({
    number_of_media_received_by_type: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(VerticalBarMediaReceivedByType, graphql`
  fragment VerticalBarMediaReceivedByType_statistics on TeamStatistics {
    number_of_media_received_by_type
  }
`);
