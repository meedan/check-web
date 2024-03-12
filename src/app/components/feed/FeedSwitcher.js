import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';
import styles from './FeedSwitcher.module.css';

const FeedSwitcher = ({ teamSlug, feedDbid, value }) => {
  const changeRequestsList = (path) => {
    browserHistory.push(`/${teamSlug}/feed/${feedDbid}/${path}`);
  };

  return (
    <div className={styles.feedSwitcher}>
      <ToggleButtonGroup
        value={value}
        variant="contained"
        onChange={(e, newValue) => changeRequestsList(newValue)}
        size="small"
        exclusive
      >
        <ToggleButton value="feed" key="1">
          <FormattedMessage id="feedSwitcher.sharedRequests" defaultMessage="Shared Fact-checks" description="Button label to take the user to the list of fact-checks shared in the feed." />
        </ToggleButton>
        <ToggleButton value="requests" key="2">
          <FormattedMessage id="feedSwitcher.apiRequests" defaultMessage="API Requests" description="Button label to take the user to the list of requests coming from the API." />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

FeedSwitcher.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  feedDbid: PropTypes.number.isRequired,
  value: PropTypes.oneOf(['feed', 'requests']).isRequired,
};

export default FeedSwitcher;
