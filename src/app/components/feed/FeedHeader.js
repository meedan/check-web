import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import IconButton from '@material-ui/core/IconButton';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import CheckFeedLicenses from '../../CheckFeedLicenses';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import SchoolIcon from '../../icons/school.svg';
import CorporateFareIcon from '../../icons/corporate_fare.svg';
import OpenSourceIcon from '../../icons/open_source.svg';
import Can from '../Can';
import styles from './FeedHeader.module.css';

// Returns 'ACADEMIC', 'COMMERCIAL', 'OPEN_SOURCE' or 'UNKNOWN'
function getLicenseName(licenseId) {
  let name = 'UNKNOWN';
  Object.keys(CheckFeedLicenses).forEach((licenseName) => {
    if (licenseId === CheckFeedLicenses[licenseName]) {
      name = licenseName;
    }
  });
  return name;
}

const FeedHeader = ({ feed }) => {
  const getLicenseIcon = licenseName => ({
    ACADEMIC: <SchoolIcon />,
    COMMERCIAL: <CorporateFareIcon />,
    OPEN_SOURCE: <OpenSourceIcon />,
  }[licenseName]);

  const getLicenseTranslatedName = licenseName => ({
    ACADEMIC: <FormattedMessage id="feedHeader.licenseNameAcademic" defaultMessage="Academic" description="Feed license" />,
    COMMERCIAL: <FormattedMessage id="feedHeader.licenseNameCommercial" defaultMessage="Commercial" description="Feed license" />,
    OPEN_SOURCE: <FormattedMessage id="feedHeader.licenseNameOpenSource" defaultMessage="Open Source" description="Feed license" />,
  }[licenseName]);

  const handleClickLicense = () => {
    window.open('https://meedan.com'); // FIXME: Open page about the license
  };

  const handleClickSettings = () => {
    browserHistory.push(`/${feed.team.slug}/feed/${feed.dbid}/feed`); // FIXME: Open the feed edit page
  };

  return (
    <div className={styles.feedHeader}>
      <div className={['typography-caption', styles.feedHeaderSubtitle].join(' ')}>
        <FormattedMessage id="feedHeader.sharedFeed" defaultMessage="Shared Feed" description="Displayed on top of the feed title on the feed page." />
      </div>

      <div className={styles.feedHeaderRow}>
        <h6 className={['typography-h6', styles.feedHeaderTitle].join(' ')}>
          {feed.name}
        </h6>

        <div className={styles.feedHeaderIcons}>
          {feed.licenses.map(licenseId => (
            <Tooltip
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
              <IconButton onClick={handleClickLicense} className={styles.feedHeaderIcon}>
                {getLicenseIcon(getLicenseName(licenseId))}
              </IconButton>
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
                <SettingsOutlinedIcon />
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
