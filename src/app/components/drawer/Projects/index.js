/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import ProjectsComponent from './ProjectsComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    const feedsCreated = props.team.feeds.edges.map(f => f.node).filter(f => f.team_id === props.team.dbid);
    const feedsJoined = props.team.feed_teams.edges.map(ft => ft.node).filter(ft => !feedsCreated.find(f => f.dbid === ft.feed_id));
    const feedsInvited = props.me.feed_invitations.edges.map(f => f.node).filter(fi => fi.state === 'invited');
    const feeds = [].concat(feedsCreated, feedsJoined, feedsInvited);
    return (
      <ProjectsComponent
        currentUser={props.me}
        team={props.team}
        savedSearches={props.team.saved_searches.edges.map(ss => ss.node)}
        feeds={feeds.map(f => ({ ...f, title: (f.name || f.feed?.name) }))}
      />
    );
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const Projects = () => {
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;

  // Not in a team context
  if (teamSlug === 'check' || !teamSlug) {
    return null;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ProjectsQuery($teamSlug: String!) {
          me {
            dbid
            feed_invitations(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  state
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
            feed_teams(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  feed_id
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
      render={renderQuery}
    />
  );
};

export default Projects;
