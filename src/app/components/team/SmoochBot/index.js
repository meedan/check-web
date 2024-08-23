/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import SmoochBotComponent from './SmoochBotComponent';

const SmoochBot = ({ currentUser }) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SmoochBotQuery($teamSlug: String!) {
          root {
            current_team {
              id
              dbid
              slug
              name
              get_language
              get_languages
              permissions
              smooch_bot: team_bot_installation(bot_identifier: "smooch") {
                id
                json_settings
                lock_version
                smooch_enabled_integrations(force: true)
                team_bot: bot_user {
                  id
                  dbid
                  avatar
                  name
                  identifier
                  default
                  settings_as_json_schema(team_slug: $teamSlug)
                  settings_ui_schema
                  description: get_description
                }
              }
              tipline_resources(first: 10000) {
                edges {
                  node {
                    id
                    dbid
                    uuid
                    language
                    title
                    header_type
                    header_file_url
                    header_overlay_text
                    content_type
                    content
                    number_of_articles
                    rss_feed_url
                  }
                }
              }
            }
            team_bots_listed(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  name
                }
              }
            }
          }
        }
      `}
      render={({ props }) => {
        if (props) {
          const smoochBotDbid = props.root.team_bots_listed.edges.find(bot => bot.node.name === 'Smooch').node.dbid;
          return (<SmoochBotComponent currentUser={currentUser} smoochBotDbid={smoochBotDbid} team={props.root.current_team} />);
        }
        return null;
      }}
      variables={{
        teamSlug,
      }}
    />
  );
};

SmoochBot.propTypes = {
  currentUser: PropTypes.object.isRequired, // FIXME: List the fields needed
};

export default SmoochBot;
