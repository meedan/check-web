import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';
import { stringHelper } from '../../customHelpers';
import styles from './SaveFeed.module.css';

const FeedDataPointsSectionHeader = ({
  readOnly,
}) => (
  <div className="typography-subtitle2">
    <div className={styles.dataPointsTitle}>
      <FormattedMessage
        defaultMessage="What workspace data will be shared in this feed?"
        description="Title of section where the data points being shared in a feed can be selected."
        id="feedDataPoints.title"
      />
    </div>
    { readOnly ?
      <Alert
        content={
          <FormattedMessage
            defaultMessage="Contact {checkSupportLink} to make adjustments to the workspace data of this shared feed."
            description="Description of the alert message displayed on data points section of the edit feed page."
            id="feedDataPoints.readOnlyAlertContent"
            values={{
              checkSupportLink: (
                <a href={`mailto:${stringHelper('SUPPORT_EMAIL')}`}>
                  <FormattedMessage
                    defaultMessage="Check Support"
                    description="Text of the contact support link displayed on the alert box of the data points section in the edit feed page."
                    id="feedDataPoints.contactSupportLinkText"
                  />
                </a>
              ),
            }}
          />
        }
        title={
          <FormattedMessage
            defaultMessage="This shared feed already contains data from other collaborators."
            description="Title of the alert message displayed on data points section of the edit feed page."
            id="feedDataPoints.readOnlyAlertTitle"
          />
        }
        variant="warning"
      />
      : null
    }
  </div>
);

FeedDataPointsSectionHeader.defaultProps = {
  readOnly: false,
};

FeedDataPointsSectionHeader.propTypes = {
  readOnly: PropTypes.bool,
};

export default FeedDataPointsSectionHeader;
