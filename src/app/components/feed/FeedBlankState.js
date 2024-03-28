import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import EmptyFeedIcon from '../../icons/empty_feed.svg';
import styles from './FeedBlankState.module.css';

const FeedBlankState = ({ teamSlug, feedDbid, listDbid }) => (
  <div className={styles.feedBlankState}>
    <EmptyFeedIcon />
    <h6 className="typography-h6">
      <FormattedMessage id="feedBlankState.title" defaultMessage="No items" description="Title displayed on feed page when there are no items to be listed." />
    </h6>
    <p>
      <FormattedMessage
        id="feedBlankState.description"
        defaultMessage="Try {resetLink} to find items or verify that the {listLink} has items"
        description="Message displayed on feed page when there are no items to be listed. English values for placeholders link text: 'resetLink' is 'resetting filters' and 'listLink' is 'source list'."
        values={{
          resetLink: (
            <Link to={`/${teamSlug}/feed/${feedDbid}/feed`}>
              <FormattedMessage
                id="feedBlankState.resetLinkText"
                defaultMessage="resetting filters"
                description="Link text that is part of message displayed when a feed does not return any items. The message where it appears reads: 'Try resetting filters to find items'."
              />
            </Link>
          ),
          listLink: (
            listDbid ?
              <Link to={`/${teamSlug}/list/${listDbid}`}>
                <FormattedMessage
                  id="feedBlankState.listLinkText"
                  defaultMessage="source list"
                  description="Link text that is part of message displayed when a feed does not return any items. The message where it appears reads: 'Verify that the source list has items'."
                />
              </Link> :
              <FormattedMessage id="feedBlankState.listText" defaultMessage="source list" description="Text that is part of message displayed when a feed does not return any items." />
          ),
        }}
      />
    </p>
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
