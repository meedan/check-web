import React from 'react';
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
        ...TeamBots_root
      }
    }
  `}
  render={({ props }) => {
    if (props) {
      return (
        <>
          <SettingsHeader
            context={
              <FormattedHTMLMessage
                defaultMessage='Connect your Check workflow with third-party services. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about integrations</a>.'
                description="Context description for the functionality of this page"
                id="teamIntegrations.helpContext"
                values={{ helpLink: 'https://help.checkmedia.org/en/articles/6925397-integrations' }}
              />
            }
            title={
              <FormattedMessage
                defaultMessage="Integrations"
                description="Settings page title for the Integrations section"
                id="teamIntegrations.title"
              />
            }
          />
          <div className={cx('team-integrations', settingsStyles['setting-details-wrapper'])}>
            <TeamBots root={props.root} />
          </div>
        </>
      );
    }
    return null;
  }}
  variables={{}}
/>);

export default TeamIntegrations;
