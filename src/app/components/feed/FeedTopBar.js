import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import QuickFilterMenu from './QuickFilterMenu';
import ShareIcon from '../../icons/share.svg';
import AddIcon from '../../icons/add_circle.svg';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TeamAvatar from '../team/TeamAvatar';
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
  const hasList = Boolean(feed.saved_search);

  const handleClick = () => {
    const customListDbid = feed.current_feed_team.saved_search?.dbid || feed.saved_search.dbid;
    browserHistory.push(`/${team.slug}/list/${customListDbid}`);
  };

  const handleClickAdd = () => {
    browserHistory.push(`/${team.slug}/feed/${feed.dbid}/edit`);
  };

  if (!feed.published) {
    return null;
  }

  const OrgFilterButton = ({
    avatar,
    current,
    dbid,
    enabled,
    name,
    slug,
  }) => {
    const handleFilterClick = () => {
      // remove this team from the filter
      if (enabled) {
        const newTeamFilters = teamFilters.filter(item => item !== dbid);
        setTeamFilters(newTeamFilters);
      } else {
        const newTeamFilters = [...teamFilters]; // need to clone array here
        newTeamFilters.push(dbid);
        // add this team back to the filter
        setTeamFilters(newTeamFilters);
      }
    };

    let message;
    if (!enabled) {
      message = (
        <FormattedMessage
          defaultMessage="Show items from {orgName}"
          description="Tooltip message displayed on button that the user presses in order to show items from an organization."
          id="feedTopBar.showItems"
          values={{
            orgName: name,
          }}
        />
      );
    } else {
      message = (
        <FormattedMessage
          defaultMessage="Hide items from {orgName}"
          description="Tooltip message displayed on button that the user presses in order to hide items from an organization."
          id="feedTopBar.hideItems"
          values={{
            orgName: name,
          }}
        />
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <Tooltip
          arrow
          placement="top"
          title={message}
        >
          <button
            className={cx(
              'feed-top-bar-item',
              'int-feed-top-bar__button--filter-org',
              styles.feedTopBarItem,
              {
                [styles.feedTopBarButton]: enabled,
                [styles.feedTopBarButtonDisabled]: !enabled,
                [styles.feedTopBarButtonHasList]: current && hasList,
              })
            }
            onClick={handleFilterClick}
          >
            <TeamAvatar className={styles.feedListAvatar} size="24px" team={{ avatar, slug }} />
            {
              current && (
                <div className="typography-body2">
                  {
                    hasList ?
                      <div className={`${styles.feedTopBarList} feed-top-bar-list`}>
                        <span className={styles.feedListTitle}>{feed.current_feed_team?.saved_search?.title || feed.saved_search.title}</span>
                      </div> :
                      <span className={styles.feedNoListTitle}><FormattedMessage defaultMessage="no list selected" description="Message displayed on feed top bar when there is no list associated with the feed." id="feedTopBar.noListSelected" /></span>
                  }
                </div>)
            }
          </button>
        </Tooltip>
        { current && hasList && (
          <Tooltip
            arrow
            placement="right"
            title={<FormattedMessage
              defaultMessage="Go to custom list"
              description="Tooltip message displayed on button that the user presses in order to navigate to the custom list page."
              id="feedTopBar.customList"
            />}
          >
            <span className={styles.feedTopBarCustomListButton}>
              <ButtonMain
                className={cx(styles.feedListIcon, 'int-feed-top-bar__icon-button--settings')}
                iconCenter={<ShareIcon />}
                size="small"
                theme="lightText"
                variant="contained"
                onClick={handleClick}
              />
            </span>
          </Tooltip>
        )}
      </div>
    );
  };

  const currentOrg = feed.teams?.edges.find(feedTeam => feedTeam.node.slug === team.slug).node;
  const teamsWithoutCurrentOrg = feed.teams?.edges.filter(feedTeam => feedTeam.node.slug !== team.slug);

  return (
    <div className={searchResultsStyles['search-results-top-extra']}>
      <div className={styles.feedTopBarContainer}>
        <div className={`${styles.feedTopBarLeft} feed-top-bar`}>
          <OrgFilterButton
            avatar={currentOrg.avatar}
            current
            dbid={currentOrg.dbid}
            enabled={teamFilters.includes(currentOrg.dbid)}
            name={currentOrg.name}
            slug={currentOrg.slug}
          />
          { teamsWithoutCurrentOrg.map((feedTeam) => {
            const {
              avatar,
              dbid,
              name,
              slug,
            } = feedTeam.node;
            return (
              <OrgFilterButton
                avatar={avatar}
                dbid={dbid}
                enabled={teamFilters.includes(dbid)}
                name={name}
                slug={slug}
              />
            );
          // sort the remaining items alphabetically per locale
          }).sort((a, b) => a.props.name.localeCompare(b.props.name))}
          <Can permission="update Feed" permissions={feed.permissions}>
            <Tooltip
              arrow
              placement="top"
              title={
                <FormattedMessage
                  defaultMessage="Add a collaborating organization"
                  description="Tooltip message displayed on a button that takes the user toa page where they can add an organization to this shared feed with an expectation to collaborate with the organization."
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
    avatar: PropTypes.string,
  }).isRequired,
  teamFilters: PropTypes.arrayOf(PropTypes.number).isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedTopBar };

export default createFragmentContainer(FeedTopBar, graphql`
  fragment FeedTopBar_team on Team {
    slug
    avatar
  }
  fragment FeedTopBar_feed on Feed {
    dbid
    published
    permissions
    teams(first: 1000) {
      edges {
        node {
          dbid
          avatar
          name
          slug
        }
      }
    }
    current_feed_team {
      saved_search {
        dbid
        title
      }
    }
    saved_search {
      dbid
      title
    }
  }
`);
