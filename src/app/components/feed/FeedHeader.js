import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '../../icons/settings.svg';
import { getLicenseIcon, getLicenseTranslatedName, getLicenseName } from '../../CheckFeedLicenses';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import Can from '../Can';
import styles from './FeedHeader.module.css';

const FeedHeader = ({ feed }) => {
  const handleClickLicense = () => {
    window.open('https://meedan.com'); // FIXME: Open page about the license
  };

  const handleClickSettings = () => {
    browserHistory.push(`/${feed.team.slug}/feed/${feed.dbid}/edit`);
  };

  return (
    <div className="feed-header">
      <div className={styles.seachHeaderTitle}>
        <h6 title={feed.name}>
          {feed.name}
        </h6>

        <div className={styles.feedHeaderIcons}>
          {feed.licenses.map(licenseId => (
            <Tooltip
              key={licenseId}
              placement="right"
              title={
                <FormattedMessage
                  id="feedHeader.tooltipLicense"
                  defaultMessage="Feed License: {licenseName}"
                  values={{
                    licenseName: getLicenseTranslatedName(getLicenseName(licenseId)),
                  }}
                  description="Tooltip message displayed on feed license icon."
                />
              }
              arrow
            >
              <div className="feed-header-icon">
                <IconButton onClick={handleClickLicense} className={styles.feedHeaderIcon}>
                  {getLicenseIcon(getLicenseName(licenseId))}
                </IconButton>
              </div>
            </Tooltip>
          ))}

          <Can permissions={feed.permissions} permission="update Feed">
            <Tooltip
              placement="right"
              title={
                <FormattedMessage
                  id="feedHeader.tooltipSettings"
                  defaultMessage="Shared Feed Settings"
                  description="Tooltip message displayed on feed settings icon."
                />
              }
              arrow
            >
              <IconButton onClick={handleClickSettings} className={styles.feedHeaderIcon}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Can>
        </div>
      </div>
    </div>
  );
};

FeedHeader.defaultProps = {};

FeedHeader.propTypes = {
  feed: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    licenses: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"update Feed":true}'
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedHeader };

export default createFragmentContainer(FeedHeader, graphql`
  fragment FeedHeader_feed on Feed {
    dbid
    name
    licenses
    permissions
    team {
      slug
    }
  }
`);
