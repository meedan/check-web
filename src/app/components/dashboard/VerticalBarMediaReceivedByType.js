import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { getMediaTypeDisplayName } from '../media/MediaTypeDisplayName';
import VerticalBarChartWidget from '../cds/charts/VerticalBarChartWidget';

const VerticalBarMediaReceivedByType = ({ intl, statistics }) => (
  <FormattedMessage
    defaultMessage="Media Received"
    description="Title for the number of media received by type widget"
    id="verticalBarMediaReceivedByType.title"
  >
    {title => (
      <VerticalBarChartWidget
        data={
          Object.entries(statistics.number_of_media_received_by_media_type).map(([name, value]) => ({
            name: getMediaTypeDisplayName(name, intl),
            value,
          }))
        }
        title={title}
      />
    )}
  </FormattedMessage>
);

VerticalBarMediaReceivedByType.propTypes = {
  statistics: PropTypes.shape({
    number_of_media_received_by_media_type: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(injectIntl(VerticalBarMediaReceivedByType), graphql`
  fragment VerticalBarMediaReceivedByType_statistics on TeamStatistics {
    number_of_media_received_by_media_type
  }
`);
