import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import TimelineWidget from '../cds/charts/TimelineWidget';

const TimelineTiplineMessageVolume = ({ statistics }) => (
  <TimelineWidget
    data={
      Object.entries(statistics.number_of_messages_by_date).map(([date, value]) => ({
        date: `${date}T23:59:59.000Z`,
        value,
        incomingValue: statistics.number_of_incoming_messages_by_date[date],
        outgoingValue: statistics.number_of_outgoing_messages_by_date[date],
      }))
    }
    title={
      <FormattedMessage
        defaultMessage="Tipline Message Volume"
        description="Title for the tipline message volume widget"
        id="timelineTiplineMessageVolume.title"
      />
    }
    tooltipFormatter={(value, name, props) => [(
      <>
        <div>
          <FormattedMessage
            defaultMessage="• {messageCount} Incoming Messages"
            description="Tooltip for the tipline message volume widget"
            id="timelineTiplineMessageVolume.tooltipIncoming"
            values={{ messageCount: props.payload.incomingValue }}
          />
        </div>
        <div>
          <FormattedMessage
            defaultMessage="• {messageCount} Outgoing Messages"
            description="Tooltip for the tipline message volume widget"
            id="timelineTiplineMessageVolume.tooltipOutgoing"
            values={{ messageCount: props.payload.outgoingValue }}
          />
        </div>
      </>
    )]}
  />
);

TimelineTiplineMessageVolume.propTypes = {
  statistics: PropTypes.shape({
    number_of_messages_by_date: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(TimelineTiplineMessageVolume, graphql`
  fragment TimelineTiplineMessageVolume_statistics on TeamStatistics {
    number_of_messages_by_date
    number_of_incoming_messages_by_date
    number_of_outgoing_messages_by_date
  }
`);
