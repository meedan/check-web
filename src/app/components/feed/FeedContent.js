/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import SelectListQueryRenderer from './SelectList';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';
import styles from './SaveFeed.module.css';

const FeedContent = ({
  dataPoints,
  listId,
  onChange,
  onRemove,
}) => (
  <div className={cx(styles.saveFeedCard, styles.feedContentCard)}>
    <div className="typography-subtitle2">
      <FormattedMessage
        defaultMessage="Feed content from this workspace"
        description="Title of section where a list can be selected as the content of the feed"
        id="saveFeed.feedContentTitle"
      />
    </div>

    <div className="typography-body2">

      {/* Feed is sharing claim & fact-checks but not media & requests */}
      { dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS) && !dataPoints.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS) ?
        <FormattedHTMLMessage
          defaultMessage="Select a custom filtered list of <strong>published claim & fact-checks</strong> from your workspace to contribute to this shared feed. You will be able to update this list at any time."
          description="Helper text for the feed content section when the feed is sharing only claim & fact-checks."
          id="saveFeed.feedContentBlurbFactChecksOnly"
        /> : null }

      {/* Feed is sharing media & requests but not claim & fact-checks */}
      { !dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS) && dataPoints.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS) ?
        <FormattedHTMLMessage
          defaultMessage="Select a custom filtered list of <strong>media clusters & requests</strong> from your workspace to contribute to this shared feed. You will be able to update this list at any time."
          description="Helper text for the feed content section when the feed is sharing only media clusters and requests containing that media."
          id="saveFeed.feedContentBlurbMediaOnly"
        /> : null }

      {/* Feed is sharing both claim & fact-checks and media & requests */}
      { dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS) && dataPoints.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS) ?
        <FormattedHTMLMessage
          defaultMessage="Select a custom filtered list of <strong>published claim & fact-checks or media clusters & requests</strong> from your workspace to contribute to this shared feed. You will be able to update this list at any time."
          description="Helper text for the feed content section when the feed is sharing fact-checks and media."
          id="saveFeed.feedContentBlurbFactChecksAndMedia"
        /> : null }

    </div>

    <SelectListQueryRenderer
      label={
        <FormattedHTMLMessage
          defaultMessage="Custom List"
          description="Helper text for the feed content list select drop-down."
          id="saveFeed.feedContentSelectLabel"
        />
      }
      required
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
