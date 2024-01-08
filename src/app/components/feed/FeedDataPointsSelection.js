import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styles from './SaveFeed.module.css';

const FeedDataPointsSelection = (props) => {
  const [dataPoints, setDataPoints] = React.useState(props.dataPoints || []);

  return (
    <div className={styles.saveFeedCard}>
      <div className="typography-subtitle2">
        <FormattedMessage
          id="feedDataPointsSelection.feedDataPointsSelectionTitle"
          defaultMessage="What workspace data will be shared in this feed?"
          description="Title of section where the data points being shared in a feed can be selected."
        />
        {/* STOPPED HERE: Need to replace this <button /> by the sections and toggles */}
        <button onClick={setDataPoints}>{dataPoints}</button>
      </div>
    </div>
  );
};

FeedDataPointsSelection.defaultProps = {
  dataPoints: [],
};

FeedDataPointsSelection.propTypes = {
  dataPoints: PropTypes.arrayOf(PropTypes.number.isRequired),
};

export default FeedDataPointsSelection;
