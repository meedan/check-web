import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Collapse from '@material-ui/core/Collapse';
import cx from 'classnames/bind';
import ApiKeyCreate from './ApiKeyCreate';
import ApiKeyEntry from './ApiKeyEntry';
import BlankState from '../layout/BlankState';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import SettingsIcon from '../../icons/settings.svg';
import HelpIcon from '../../icons/help.svg';
import ExternalLink from '../ExternalLink';
import settingsStyles from './Settings.module.css';
import styles from './ApiKeys.module.css';

const ApiKeys = ({ team }) => {
  const apiKeys = team.api_keys;

  const [expandKeys, setExpandKeys] = React.useState(false);
  const [toggleChecked, setToggleChecked] = React.useState(apiKeys.edges.length !== 0);
  return (
    <div className={cx('api-keys', settingsStyles['setting-content-container'])}>
      <div className={settingsStyles['setting-content-container-title']}>
        <FormattedMessage
          defaultMessage="API Access"
          description="Title of the API key creation widget"
          id="apiKeys.title"
          values={{ count: apiKeys.edges.length }}
        />
        <div className={settingsStyles['setting-content-container-actions']}>
          <ButtonMain
            className="api-keys__settings-icon"
            disabled={!toggleChecked}
            iconCenter={<SettingsIcon />}
            size="default"
            theme="text"
            variant="text"
            onClick={() => setExpandKeys(!expandKeys)}
          />
        </div>
      </div>
      <SwitchComponent
        checked={toggleChecked}
        className="api-keys__toggle-switch"
        label={
          <FormattedMessage
            defaultMessage="Query and manage workspace content with the Check API and workspace access tokens. API keys have the same access rights as Check Editors and are enabled immediately."
            description="Title of the API key creation widget"
            id="apiKeys.toggleLabel"
          />
        }
        labelPlacement="end"
        onChange={() => {
          setToggleChecked(!toggleChecked);
          setExpandKeys(!toggleChecked);
        }}
      />
      <Collapse className={styles['integration-details']} in={toggleChecked && expandKeys} timeout="auto">
        <div>
          <div className={`typography-subtitle2 ${styles['api-keys-heading']}`}>
            <FormattedMessage
              defaultMessage="API Keys [{count}]"
              description="Title of the API key creation widget"
              id="apiKeys.countHeader"
              values={{ count: apiKeys.edges.length }}
            />
            <ApiKeyCreate />
          </div>
          <div className={styles['api-keys']}>
            {apiKeys.edges.length === 0 &&
              <div className={styles['apikey-entry-root']}>
                <BlankState noMargin>
                  <FormattedMessage
                    defaultMessage="No API Keys"
                    description="Label for initial state when there are no API keys created for the current workspace"
                    id="apiKeys.empty"
                  />
                </BlankState>
                <div className={styles['api-keys-empty-blurb']}>
                  <FormattedMessage
                    defaultMessage="Add a new key to connect to the Check API"
                    description="Subtitle for initial state when there are no API keys created for the current workspace"
                    id="apiKeys.emptyBlurb"
                  />
                </div>
              </div>
            }
            {apiKeys.edges.map(ak => (<ApiKeyEntry apiKey={ak.node} key={ak.node.dbid} />))}
          </div>
          <div className={`typography-caption ${styles['api-keys-footer']}`}>
            <HelpIcon />
            <div>
              <FormattedMessage
                defaultMessage="Check out our guide to using the {checkApi} or to troubleshoot common issues."
                description="Footer text in API key creation widget"
                id="apiKeys.footer"
                values={{
                  checkApi: <ExternalLink className="api-keys__api-doc-link" url="https://help.checkmedia.org/en/articles/8773856-check-api-introduction">Check API</ExternalLink>,
                }}
              />
              {' '}
              { /* The following <a /> element requires Intercom to be configured. Make sure `intercomAppId` is set correctly in config.js  */}
              { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a className="api-keys__intercom-link" href="#" onClick={(e) => { if (Intercom) { Intercom('showNewMessage'); e.preventDefault(); } }}>
                <FormattedMessage
                  defaultMessage="Connect with us directly for support."
                  description="Footer text in API key creation widget"
                  id="apiKeys.footerSupport"
                />
              </a>
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

ApiKeys.propTypes = {
  team: PropTypes.shape({
    api_keys: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
    }).isRequired,
  }).isRequired,
};

export { ApiKeys }; // eslint-disable-line import/no-unused-modules
export default createFragmentContainer(ApiKeys, graphql`
  fragment ApiKeys_team on Team {
    api_keys(first: 10000) {
      edges {
        node {
          dbid
          ...ApiKeyEntry_apiKey
        }
      }
    }
  }
`);
