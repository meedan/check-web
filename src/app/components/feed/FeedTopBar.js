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

const FeedTopBar = ({
  team,
  feed,
  teamFilters,
  hideQuickFilterMenu,
  setTeamFilters,
}) => {
  const hasList = Boolean(feed.saved_search);

  const handleClick = () => {
    browserHistory.push(`/${team.slug}/list/${feed.saved_search.dbid}`);
  };

  const handleClickAdd = () => {
    browserHistory.push(`/${team.slug}/feed/${feed.dbid}/edit`);
  };

  if (!feed.published) {
    return null;
  }

  const OrgFilterButton = ({
    avatar,
    dbid,
    enabled,
    slug,
    name,
    current,
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
          id="feedTopBar.showItems"
          defaultMessage="Show items from {orgName}"
          description="Tooltip message displayed on button that the user presses in order to show items from an organization."
          values={{
            orgName: name,
          }}
        />
      );
    } else {
      message = (
        <FormattedMessage
          id="feedTopBar.hideItems"
          defaultMessage="Hide items from {orgName}"
          description="Tooltip message displayed on button that the user presses in order to hide items from an organization."
          values={{
            orgName: name,
          }}
        />
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <Tooltip
          placement="top"
          title={message}
          arrow
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
            <TeamAvatar className={styles.feedListAvatar} team={{ avatar, slug }} size="24px" />
            {
              current && (
                <div className="typography-body2">
                  {
                    hasList ?
                      <div className={`${styles.feedTopBarList} feed-top-bar-list`}>
                        <span className={styles.feedListTitle}>{feed.saved_search.title}</span>
                      </div> :
                      <span className={styles.feedNoListTitle}><FormattedMessage id="feedTopBar.noListSelected" defaultMessage="no list selected" description="Message displayed on feed top bar when there is no list associated with the feed." /></span>
                  }
                </div>)
            }
          </button>
        </Tooltip>
        { current && hasList && (
          <Can permissions={feed.permissions} permission="update Feed">
            <Tooltip
              placement="right"
              title={<FormattedMessage
                id="feedTopBar.customList"
                defaultMessage="Go to custom list"
                description="Tooltip message displayed on button that the user presses in order to navigate to the custom list page."
              />}
              arrow
            >
              <span className={styles.feedTopBarCustomListButton}>
                <ButtonMain
                  size="small"
                  variant="contained"
                  theme="lightText"
                  onClick={handleClick}
                  className={cx(styles.feedListIcon, 'int-feed-top-bar__icon-button--settings')}
                  iconCenter={<ShareIcon />}
                />
              </span>
            </Tooltip>
          </Can>
        )}
      </div>
    );
  };

  const currentOrg = feed.teams?.edges.find(feedTeam => feedTeam.node.slug === team.slug).node;
  const teamsWithoutCurrentOrg = feed.teams?.edges.filter(feedTeam => feedTeam.node.slug !== team.slug);

  return (
    <div className={styles.feedTopBarContainer}>
      <div className={`${styles.feedTopBar} feed-top-bar`}>
        <OrgFilterButton
          avatar={currentOrg.avatar}
          slug={currentOrg.slug}
          dbid={currentOrg.dbid}
          enabled={teamFilters.includes(currentOrg.dbid)}
          name={currentOrg.name}
          current
        />
        { teamsWithoutCurrentOrg.map((feedTeam) => {
          const {
            avatar,
            slug,
            dbid,
            name,
          } = feedTeam.node;
          return (
            <OrgFilterButton
              avatar={avatar}
              slug={slug}
              dbid={dbid}
              enabled={teamFilters.includes(dbid)}
              name={name}
            />
          );
        // sort the remaining items alphabetically per locale
        }).sort((a, b) => a.props.name.localeCompare(b.props.name))}
        <Can permissions={feed.permissions} permission="update Feed">
          <Tooltip
            placement="top"
            title={
              <FormattedMessage
                id="feedTopBar.addOrg"
                defaultMessage="Add a collaborating organization"
                description="Tooltip message displayed on a button that takes the user toa page where they can add an organization to this shared feed with an expectation to collaborate with the organization."
              />
            }
            arrow
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
            setTeamFilters={setTeamFilters}
            currentOrg={currentOrg}
            teamsWithoutCurrentOrg={teamsWithoutCurrentOrg}
          /> :
          null
        }
      </div>
    </div>
  );
};

FeedTopBar.defaultProps = {
  hideQuickFilterMenu: false,
};

FeedTopBar.propTypes = {
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  }).isRequired,
  feed: PropTypes.shape({
    published: PropTypes.bool.isRequired,
    permissions: PropTypes.string.isRequired, // e.g., '{"update Feed":true}'
    saved_search: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    }),
  }).isRequired,
  teamFilters: PropTypes.arrayOf(PropTypes.number).isRequired, // Array of team DBIDs
  setTeamFilters: PropTypes.func.isRequired,
  hideQuickFilterMenu: PropTypes.bool,
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
    saved_search {
      dbid
      title
    }
  }
`);
