import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import styles from './SaveFeed.module.css';
import SelectListQueryRenderer from './SelectList';
import ExternalLink from '../ExternalLink';

const FeedContent = ({
  listId,
  onChange,
  onRemove,
}) => (
  <div className={styles.saveFeedCard}>
    <div className="typography-subtitle2">
      <FormattedMessage
        id="saveFeed.feedContentTitle"
        defaultMessage="Feed content"
        description="Title of section where a list can be selected as the content of the feed"
      />
    </div>
    <div className="typography-body2">
      <FormattedMessage
        id="saveFeed.feedContentBlurb"
        defaultMessage="Select a filtered list of fact-checks from your workspace to contribute to this shared feed. You will be able to update this list at any time."
        description="Helper text for the feed content section"
      />
    </div>
    <div className="typography-body2">
      <FormattedHTMLMessage
        id="saveFeed.feedContentBlurb2"
        defaultMessage="<strong>Note:</strong> Your list must contain <strong>published fact-checks</strong> in order to be part of this shared feed."
        description="Helper text for the feed content section"
      />
    </div>
    <SelectListQueryRenderer
      required
      value={listId}
      onChange={onChange}
      onRemove={onRemove}
      helperText={(
        <span>
          <FormattedMessage id="saveFeed.selectHelper" defaultMessage="Fact-check title, summary, and URL will be shared with the feed." description="Helper text for shared feed list selector" />
          &nbsp;
          <ExternalLink url="https://www.meedan.com">{ /* FIXME update url */}
            <FormattedMessage id="saveFeed.learnMore" defaultMessage="Learn more." description="Link to external page with more details about shared feeds" />
          </ExternalLink>
        </span>
      )}
    />
  </div>
);

FeedContent.defaultProps = {
  listId: null,
};

FeedContent.propTypes = {
  listId: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default FeedContent;
