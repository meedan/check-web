/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
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
          api_keys(first: 10000) {
            edges {
              node {
                id
                dbid
                title
                description
                access_token
                created_at
                expire_at
                user {
                  name
                }
              }
            }
          }
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
                description="Settings page title for the Integrations section"
              />
            }
            context={
              <FormattedHTMLMessage
                id="teamIntegrations.helpContext"
                defaultMessage='Connect your Check workflow with third-party services. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about integrations</a>.'
                values={{ helpLink: 'https://help.checkmedia.org/en/articles/6925397-integrations' }}
                description="Context description for the functionality of this page"
              />
            }
          />
          <div className={cx('team-integrations', settingsStyles['setting-details-wrapper'])}>
            <TeamBots {...props} />
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
