/* eslint-disable @calm/react-intl/missing-attribute, relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';

import SlackConfig from './SlackConfig';
import SettingsHeader from './SettingsHeader';
import TeamBots from './TeamBots';
import { ContentColumn } from '../../styles/js/shared';

const TeamIntegrations = () => (<QueryRenderer
  environment={Relay.Store}
  query={graphql`
    query TeamIntegrationsQuery {
      root {
        current_team {
          id
          dbid
          team_bot_installations(first: 10000) {
            edges {
              node {
                id
                json_settings
                bot_user {
                  id
                }
                team {
                  id
                  dbid
                }
                team_bot: bot_user {
                  id
                  dbid
                }
              }
            }
          }
          ...SlackConfig_team
        }
        team_bots_approved(first: 10000) {
          edges {
            node {
              id
              dbid
              avatar
              name
              default
              identifier
              description: get_description
              team_author {
                name
                slug
              }
              installation {
                id
                json_settings
                team {
                  id
                  dbid
                }
                team_bot: bot_user {
                  id
                  dbid
                }
              }
            }
          }
        }
      }
    }
  `}
  variables={{}}
  render={({ props }) => {
    if (props) {
      return (
        <Box className="team-integrations">
          <ContentColumn>
            <SettingsHeader
              title={
                <FormattedMessage
                  id="teamIntegrations.title"
                  defaultMessage="Integrations"
                />
              }
              subtitle={
                <FormattedMessage
                  id="teamIntegrations.subtitle"
                  defaultMessage="Third party tools to enhance productivity."
                />
              }
              helpUrl="https://help.checkmedia.org/en/articles/4841437-integrations"
            />
            <Box className="team-integrations__integrations">
              <TeamBots {...props} />
              <SlackConfig team={props.root.current_team} />
            </Box>
          </ContentColumn>
        </Box>
      );
    }
    return null;
  }}
/>);

TeamIntegrations.propTypes = {
  // FIXME: Specify the required fields of "team"
  team: PropTypes.object.isRequired,
};

export default TeamIntegrations;
