import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import Typography from '@material-ui/core/Typography';
import EmptyFeedIcon from '../../icons/empty_feed.svg';
import styles from './FeedBlankState.module.css';

const FeedBlankState = ({ teamSlug, feedDbid, listDbid }) => (
  <div className={styles.feedBlankState}>
    <EmptyFeedIcon />
    <h6 className="typography-h6">
      <FormattedMessage id="feedBlankState.title" defaultMessage="No fact-checks" description="Title displayed on feed page when there are no fact-checks to be listed." />
    </h6>
    <Typography variant="body1" component="p" paragraph>
      <FormattedMessage
        id="feedBlankState.description"
        defaultMessage="Try {resetLink} to find fact-checks or verify that the {listLink} has items"
        description="Message displayed on feed page when there are no fact-checks to be listed."
        values={{
          resetLink: (
            <Link to={`/${teamSlug}/feed/${feedDbid}/feed`}>
              <FormattedMessage id="feedBlankState.resetLinkText" defaultMessage="resetting filters" description="Link text that is part of message displayed when a feed does not return any fact-checks." />
            </Link>
          ),
          listLink: (
            listDbid ?
              <Link to={`/${teamSlug}/list/${listDbid}`}>
                <FormattedMessage id="feedBlankState.listLinkText" defaultMessage="source list" description="Link text that is part of message displayed when a feed does not return any fact-checks." />
              </Link> :
              <FormattedMessage id="feedBlankState.listText" defaultMessage="source list" description="Text that is part of message displayed when a feed does not return any fact-checks." />
          ),
        }}
      />
    </Typography>
  </div>
);

FeedBlankState.defaultProps = {
  listDbid: null,
};

FeedBlankState.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  feedDbid: PropTypes.number.isRequired,
  listDbid: PropTypes.number,
};

export default FeedBlankState;
