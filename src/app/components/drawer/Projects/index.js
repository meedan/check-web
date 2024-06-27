/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import ProjectsComponent from './ProjectsComponent';
import FeedsComponent from './FeedsComponent';
import ArticlesComponent from '../../article/ArticlesComponent';
import SettingsComponent from './SettingsComponent';
import UserSettingsComponent from './UserSettingsComponent';

const renderQuery = ({ error, props, drawerType }) => {
  if (!error && props) {
    const feedsCreated = props.team.feeds.edges.map(f => f.node).filter(f => f.team_id === props.team.dbid);
    const feedsJoined = props.team.feed_teams.edges.map(ft => ft.node).filter(ft => !feedsCreated.find(f => f.dbid === ft.feed_id));
    const feedsInvited = props.me.feed_invitations.edges.map(f => f.node).filter(fi => fi.state === 'invited');
    const feeds = [].concat(feedsCreated, feedsJoined, feedsInvited);
    if (drawerType === 'tipline') {
      return (
        <ProjectsComponent
          currentUser={props.me}
          team={props.team}
          savedSearches={props.team.saved_searches.edges.map(ss => ss.node)}
        />
      );
    } else if (drawerType === 'feed') {
      return (
        <FeedsComponent
          team={props.team}
          feeds={feeds.map(f => ({ ...f, title: (f.name || f.feed?.name), dbid: (f.feed_id || f.dbid) }))}
        />
      );
    } else if (drawerType === 'settings') {
      return (
        <SettingsComponent
          team={props.team}
          params={props.params}
        />
      );
    } else if (drawerType === 'user') {
      return (
        <UserSettingsComponent
          me={props.me}
          params={props.params}
        />
      );
    } else if (drawerType === 'articles') {
      return (
        <ArticlesComponent
          me={props.me}
          team={props.team}
          params={props.params}
        />
      );
    }
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const Projects = ({ drawerType }) => {
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;

  // Not in a team context
  if (!teamSlug) {
    return null;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ProjectsQuery($teamSlug: String!) {
          me {
            id
            dbid
            feed_invitations(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  state
                  feed_id
                  feed {
                    name
                  }
                  type: __typename
                }
              }
            }
          }
          team(slug: $teamSlug) {
            dbid
            slug
            medias_count
            permissions
            verification_statuses
            smooch_bot: team_bot_installation(bot_identifier: "smooch") {
              id
            }
            fetch_bot: team_bot_installation(bot_identifier: "fetch") {
              id
            }
            alegre_bot: team_bot_installation(bot_identifier: "alegre") {
              id
              alegre_settings
            }
            saved_searches(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                  filters
                  is_part_of_feeds
                  medias_count: items_count
                }
              }
            }
            feeds(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  name
                  team_id
                  type: __typename
                }
              }
            }
            tag_texts(first: 100) {
              edges {
                node {
                  text
                }
              }
            }
            feed_teams(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  feed_id
                  saved_search_id
                  feed {
                    name
                  }
                  type: __typename
                }
              }
            }
            trash_count
            spam_count
          }
        }
      `}
      variables={{
        teamSlug,
      }}
      render={({ error, props }) => renderQuery({ error, props, drawerType })}
    />
  );
};

export default Projects;
