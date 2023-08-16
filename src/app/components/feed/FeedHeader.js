import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SettingsIcon from '../../icons/settings.svg';
import { getLicenseIcon, getLicenseTranslatedName, getLicenseName } from '../../CheckFeedLicenses';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import Can from '../Can';
import searchResultsStyles from '../search/SearchResults.module.css';

const FeedHeader = ({ feed }) => {
  const handleClickLicense = () => {
    window.open('https://meedan.com'); // FIXME: Open page about the license
  };

  const handleClickSettings = () => {
    browserHistory.push(`/${feed.team.slug}/feed/${feed.dbid}/edit`);
  };

  return (
    <div className="feed-header">
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
  feed: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
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
    licenses
    permissions
    team {
      slug
    }
  }
`);
