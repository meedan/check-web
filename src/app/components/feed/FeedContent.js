import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';
import SelectListQueryRenderer from './SelectList';
import styles from './SaveFeed.module.css';

const FeedContent = ({
  listId,
  dataPoints,
  onChange,
  onRemove,
}) => (
  <div className={cx(styles.saveFeedCard, styles.feedContentCard)}>
    <div className="typography-subtitle2">
      <FormattedMessage
        id="saveFeed.feedContentTitle"
        defaultMessage="Feed content from this workspace"
        description="Title of section where a list can be selected as the content of the feed"
      />
    </div>

    <div className="typography-body2">

      {/* Feed is sharing fact-checks but not media/claim/requests */}
      { dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS) && !dataPoints.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS) ?
        <FormattedHTMLMessage
          id="saveFeed.feedContentBlurbFactChecksOnly"
          defaultMessage="Select a custom filtered list of <strong>published fact-checks</strong> from your workspace to contribute to this shared feed. You will be able to update this list at any time."
          description="Helper text for the feed content section when the feed is sharing only fact-checks."
        /> : null }

      {/* Feed is sharing media/claim/requests but not fact-checks */}
      { !dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS) && dataPoints.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS) ?
        <FormattedHTMLMessage
          id="saveFeed.feedContentBlurbMediaOnly"
          defaultMessage="Select a custom filtered list of <strong>media, claim & requests</strong> from your workspace to contribute to this shared feed. You will be able to update this list at any time."
          description="Helper text for the feed content section when the feed is sharing only media."
        /> : null }

      {/* Feed is sharing both fact-checks and media/claim/requests */}
      { dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS) && dataPoints.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS) ?
        <FormattedHTMLMessage
          id="saveFeed.feedContentBlurbFactChecksAndMedia"
          defaultMessage="Select a custom filtered list of <strong>published fact-checks or media, claim & requests</strong> from your workspace to contribute to this shared feed. You will be able to update this list at any time."
          description="Helper text for the feed content section when the feed is sharing fact-checks and media."
        /> : null }

    </div>

    <SelectListQueryRenderer
      required
      label={
        <FormattedHTMLMessage
          id="saveFeed.feedContentSelectLabel"
          defaultMessage="Custom List"
          description="Helper text for the feed content list select drop-down."
        />
      }
      value={listId}
      onChange={onChange}
      onRemove={onRemove}
    />
  </div>
);

FeedContent.defaultProps = {
  listId: null,
  dataPoints: [],
};

FeedContent.propTypes = {
  listId: PropTypes.number,
  dataPoints: PropTypes.arrayOf(PropTypes.number.isRequired),
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default FeedContent;
