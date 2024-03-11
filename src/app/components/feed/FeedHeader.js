import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SettingsIcon from '../../icons/settings.svg';
import { getLicenseIcon, getLicenseTranslatedName, getLicenseName } from '../../CheckFeedLicenses';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import Can from '../Can';
import searchResultsStyles from '../search/SearchResults.module.css';

const FeedHeader = ({ feed, feedTeam }) => {
  const handleClickLicense = () => {
    window.open('https://meedan.com'); // FIXME: Open page about the license
  };

  const handleClickSettings = () => {
    const teamSlugFromUrl = window.location.pathname.match(/^\/([^/]+)/)[1];
    browserHistory.push(`/${teamSlugFromUrl}/feed/${feed.dbid}/edit`);
  };

  const isFeedOwner = feedTeam.team_id === feed.team_id;

  const permissionRequired = isFeedOwner ? 'update Feed' : 'update FeedTeam';
  const mergedPermissions = { ...JSON.parse(feed?.permissions), ...JSON.parse(feedTeam.permissions) };

  return (
    <div className={cx('feed-header', searchResultsStyles.searchHeaderActions)}>
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
            <ButtonMain
              variant="outlined"
              size="small"
              theme="text"
              iconCenter={getLicenseIcon(getLicenseName(licenseId))}
              onClick={handleClickLicense}
              className={searchResultsStyles.searchHeaderActionButton}
            />
          </div>
        </Tooltip>
      ))}

      <Can permissions={JSON.stringify(mergedPermissions)} permission={permissionRequired}>
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
          <span>{/* Wrapper span is required for the tooltip to a ref for the mui Tooltip */}
            <ButtonMain variant="outlined" size="small" theme="text" iconCenter={<SettingsIcon />} onClick={handleClickSettings} className={searchResultsStyles.searchHeaderActionButton} />
          </span>
        </Tooltip>
      </Can>
    </div>
  );
};

FeedHeader.defaultProps = {};

FeedHeader.propTypes = {
  feedTeam: PropTypes.shape({
    team_id: PropTypes.number.isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"update FeedTeam":true}'
  }).isRequired,
  feed: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    licenses: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"update Feed":true}'
    requests_count: PropTypes.number.isRequired,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedHeader };

export default createFragmentContainer(FeedHeader, graphql`
  fragment FeedHeader_feedTeam on FeedTeam {
    team_id
    permissions
  }
  fragment FeedHeader_feed on Feed {
    dbid
    team_id
    licenses
    permissions
  }
`);
