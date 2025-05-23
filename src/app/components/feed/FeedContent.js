/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import SelectListQueryRenderer from './SelectList';
import styles from './SaveFeed.module.css';

const FeedContent = ({
  listId,
  listType,
  onChange,
  onRemove,
}) => (
  <div className={cx(styles.saveFeedCard, styles.feedContentCard)}>
    {/* Feed is sharing claim & fact-checks but not media & requests */}
    { listType === 'article' ?
      <div className="typography-subtitle2">
        <FormattedMessage
          defaultMessage="List of Articles to include in Shared Feed"
          description="Title of section where a list can be selected as the content of the feed"
          id="saveFeed.feedArticleContentTitle"
        />
      </div>
      : null }

    {/* Feed is sharing media & requests but not claim & fact-checks */}
    { listType === 'media' ?
      <div className="typography-subtitle2">
        <FormattedMessage
          defaultMessage="List of Media Clusters to include in Shared Feed"
          description="Title of section where a list can be selected as the content of the feed"
          id="saveFeed.feedMediaContentTitle"
        />
      </div>
      : null }


    <SelectListQueryRenderer
      label={
        <FormattedHTMLMessage
          defaultMessage="Custom List"
          description="Helper text for the feed content list select drop-down."
          id="saveFeed.feedContentSelectLabel"
        />
      }
      listType={listType}
      required
      value={listId}
      onChange={onChange}
      onRemove={onRemove}
    />
  </div>
);

FeedContent.defaultProps = {
  listId: null,
  listType: null,
};

FeedContent.propTypes = {
  listId: PropTypes.number,
  listType: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default FeedContent;
