/* eslint-disable @calm/react-intl/missing-attribute, relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import SlackConfig from './SlackConfig';
import SettingsHeader from './SettingsHeader';
import TeamBots from './TeamBots';
import settingsStyles from './Settings.module.css';

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
                lock_version
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
        team_bots_listed(first: 10000) {
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
        <>
          <SettingsHeader
            title={
              <FormattedMessage
                id="teamIntegrations.title"
                defaultMessage="Integrations"
              />
            }
            helpUrl="https://help.checkmedia.org/en/articles/6925397-integrations"
          />
          <div className={cx('team-integrations', settingsStyles['setting-details-wrapper'])}>
            <div className={cx('team-integrations__integrations')}>
              <TeamBots {...props} />
              <SlackConfig team={props.root.current_team} />
            </div>
          </div>
        </>
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
