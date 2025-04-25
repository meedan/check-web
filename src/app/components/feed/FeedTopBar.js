import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import QuickFilterMenu from './QuickFilterMenu';
import OrgFilterButton from './OrgFilterButton';
import AddIcon from '../../icons/add_circle.svg';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Can from '../Can';
import styles from './FeedTopBar.module.css';
import searchResultsStyles from '../search/SearchResults.module.css';

const FeedTopBar = ({
  feed,
  hideQuickFilterMenu,
  setTeamFilters,
  team,
  teamFilters,
}) => {
  const handleClickAdd = () => {
    browserHistory.push(`/${team.slug}/feed/${feed.dbid}/edit`);
  };

  const handleFilterClick = (dbid, enabled) => {
    if (enabled) {
      const newTeamFilters = teamFilters.filter(item => item !== dbid);
      setTeamFilters(newTeamFilters);
    } else {
      const newTeamFilters = [...teamFilters];
      newTeamFilters.push(dbid);
      setTeamFilters(newTeamFilters);
    }
  };

  if (!feed.published) {
    return null;
  }

  const currentOrg = feed.feed_teams?.edges.find(feedTeam => feedTeam.node.team.slug === team.slug).node.team;
  const teamsWithoutCurrentOrg = feed.feed_teams?.edges
    .filter(feedTeam => feedTeam.node.team.slug !== team.slug)
    .filter(feedTeam => Boolean(feedTeam.node.saved_search_id));

  return (
    <div className={searchResultsStyles['search-results-top-extra']}>
      <div className={styles.feedTopBarContainer}>
        <div className={`${styles.feedTopBarLeft} feed-top-bar`}>
          <OrgFilterButton
            current
            customListDbid={feed.current_feed_team?.saved_search?.dbid || feed.saved_search?.dbid}
            enabled={teamFilters.includes(currentOrg.dbid)}
            feed={feed}
            savedSearch={feed.current_feed_team?.saved_search || feed.saved_search}
            team={currentOrg}
            onClick={handleFilterClick}
          />
          { teamsWithoutCurrentOrg.map(feedTeam =>
            (
              <OrgFilterButton
                current={false}
                customListDbid={feedTeam.node.saved_search_id}
                enabled={teamFilters.includes(feedTeam.node.team.dbid)}
                feed={feed}
                key={feedTeam.node.team.dbid}
                savedSearch={feedTeam.node.saved_search}
                team={feedTeam.node.team}
                onClick={handleFilterClick}
              />
            ),
          // sort the remaining items alphabetically per locale
          ).sort((a, b) => a.props.name.localeCompare(b.props.name))}
          <Can permission="update Feed" permissions={feed.permissions}>
            <Tooltip
              arrow
              placement="top"
              title={
                <FormattedMessage
                  defaultMessage="Add a collaborating organization"
                  description="Tooltip message displayed on a button that takes the user to a page where they can add an organization to this shared feed with an expectation to collaborate with the organization."
                  id="feedTopBar.addOrg"
                />
              }
            >
              <span>{/* Wrapper span is required for the tooltip to a ref for the mui Tooltip */}
                <ButtonMain iconCenter={<AddIcon />} label="Center" size="small" theme="lightText" onClick={handleClickAdd} />
              </span>
            </Tooltip>
          </Can>
        </div>
        <div className={`${styles.feedTopBarRight} feed-top-bar-right`}>
          { !hideQuickFilterMenu ?
            <QuickFilterMenu
              currentOrg={currentOrg}
              setTeamFilters={setTeamFilters}
              teamsWithoutCurrentOrg={teamsWithoutCurrentOrg}
            /> :
            null
          }
        </div>
      </div>
    </div>
  );
};

FeedTopBar.defaultProps = {
  hideQuickFilterMenu: false,
};

FeedTopBar.propTypes = {
  feed: PropTypes.shape({
    published: PropTypes.bool.isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"update Feed":true}'
    saved_search: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    }),
  }).isRequired,
  hideQuickFilterMenu: PropTypes.bool,
  // Array of team DBIDs
  setTeamFilters: PropTypes.func.isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  teamFilters: PropTypes.arrayOf(PropTypes.number).isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedTopBar };

export default createFragmentContainer(FeedTopBar, graphql`
  fragment FeedTopBar_team on Team {
    slug
  }
  fragment FeedTopBar_feed on Feed {
    dbid
    published
    permissions
    feed_teams(first: 1000) {
      edges {
        node {
          saved_search_id
          team {
            slug
            dbid
            ...OrgFilterButton_team
          }
        }
      }
    }
    current_feed_team {
      saved_search {
        ...OrgFilterButton_savedSearch
      }
    }
    saved_search {
      ...OrgFilterButton_savedSearch
    }
  }
`);
