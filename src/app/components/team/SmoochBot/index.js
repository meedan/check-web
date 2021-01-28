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
          team(slug: $teamSlug) {
            id
            dbid
            slug
            get_language
            get_languages
            permissions
            team_bot_installations(first: 10000) {
              edges {
                node {
                  id
                  json_settings
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
              }
            }
          }
        }
      `}
      variables={{
        teamSlug,
      }}
      render={({ props }) => {
        if (props) {
          return (<SmoochBotComponent team={props.team} currentUser={currentUser} />);
        }
        return null;
      }}
    />
  );
};

SmoochBot.propTypes = {
  currentUser: PropTypes.object.isRequired, // FIXME: List the fields needed
};

export default SmoochBot;
