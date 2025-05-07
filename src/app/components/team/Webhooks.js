import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Collapse from '@material-ui/core/Collapse';
import cx from 'classnames/bind';
import WebhookEntry from './WebhookEntry';
import WebhookEdit from './WebhookEdit';
import BlankState from '../layout/BlankState';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import SettingsIcon from '../../icons/settings.svg';
import HelpIcon from '../../icons/help.svg';
import ExternalLink from '../ExternalLink';
import settingsStyles from './Settings.module.css';
import styles from './ApiKeys.module.css';

const Webhooks = ({ team }) => {
  const { webhooks } = team;

  const [expand, setExpand] = React.useState(false);
  const [toggleChecked, setToggleChecked] = React.useState(webhooks.edges.length !== 0);
  return (
    <div className={cx('api-keys', settingsStyles['setting-content-container'])}>
      <div className={settingsStyles['setting-content-container-title']}>
        <FormattedMessage
          defaultMessage="External Webhooks"
          description="Title of the webhook management widget"
          id="webhooks.title"
          values={{ count: webhooks.edges.length }}
        />
        <div className={settingsStyles['setting-content-container-actions']}>
          <ButtonMain
            className="webhooks__settings-icon"
            disabled={!toggleChecked}
            iconCenter={<SettingsIcon />}
            size="default"
            theme="text"
            variant="text"
            onClick={() => setExpand(!expand)}
          />
        </div>
      </div>
      <SwitchComponent
        checked={toggleChecked}
        className="webhooks__toggle-switch"
        label={
          <FormattedMessage
            defaultMessage="Manage integrations with external systems. Subscribe to events from Check."
            description="Description of the webhook management widget toggle switch"
            id="webhooks.toggleLabel"
          />
        }
        labelPlacement="end"
        onChange={() => {
          setToggleChecked(!toggleChecked);
          setExpand(!toggleChecked);
        }}
      />
      <Collapse className={styles['integration-details']} in={toggleChecked && expand} timeout="auto">
        <div>
          <div className={`typography-subtitle2 ${styles['api-keys-heading']}`}>
            <FormattedMessage
              defaultMessage="Webhooks [{count}]"
              description="Title of the webhook management widget"
              id="webhooks.countHeader"
              values={{ count: webhooks.edges.length }}
            />
            <WebhookEdit />
          </div>
          <div className={styles['api-keys']}>
            {webhooks.edges.length === 0 &&
              <div className={styles['apikey-entry-root']}>
                <BlankState noMargin>
                  <FormattedMessage
                    defaultMessage="No Webhooks"
                    description="Label for initial state when there are no API keys created for the current workspace"
                    id="webhooks.empty"
                  />
                </BlankState>
                <div className={styles['api-keys-empty-blurb']}>
                  <FormattedMessage
                    defaultMessage="Add a new integration to be notified of Check events"
                    description="Subtitle for initial state when there are no webhooks created for the current workspace"
                    id="webhooks.emptyBlurb"
                  />
                </div>
              </div>
            }
            {webhooks.edges.map(w => (<WebhookEntry key={w.node.dbid} webhook={w.node} />))}
          </div>
          <div className={`typography-caption ${styles['api-keys-footer']}`}>
            <HelpIcon />
            <div>
              <FormattedMessage
                defaultMessage="Check out our guide to using the {checkApi} or to troubleshoot common issues."
                description="Footer text in API key creation widget"
                id="webhooks.footer"
                values={{
                  checkApi: <ExternalLink className="webhooks__api-doc-link" url="https://help.checkmedia.org/en/articles/8773856-check-api-introduction">Check API</ExternalLink>,
                }}
              />
              {' '}
              { /* The following <a /> element requires Intercom to be configured. Make sure `intercomAppId` is set correctly in config.js  */}
              { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a className="webhooks__intercom-link" href="#" onClick={(e) => { if (Intercom) { Intercom('showNewMessage'); e.preventDefault(); } }}>
                <FormattedMessage
                  defaultMessage="Connect with us directly for support."
                  description="Footer text in API key creation widget"
                  id="webhooks.footerSupport"
                />
              </a>
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

Webhooks.propTypes = {
  team: PropTypes.shape({
    webhooks: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
    }).isRequired,
  }).isRequired,
};

export { Webhooks }; // eslint-disable-line import/no-unused-modules
export default createFragmentContainer(Webhooks, graphql`
  fragment Webhooks_team on Team {
    webhooks(first: 10000) {
      edges {
        node {
          dbid
          ...WebhookEntry_webhook
        }
      }
    }
  }
`);
