import React from 'react';
import { withRouter, Link } from 'react-router';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import { can } from '../../Can';
import UserUtil from '../../user/UserUtil';
import { withSetFlashMessage } from '../../FlashMessage';
import styles from './Projects.module.css';

const messages = defineMessages({
  annotations: {
    id: 'teamSettingsNavigation.annotations',
    defaultMessage: 'Annotations',
    description: 'Label for the Annotations settings navigation menu item',
  },
  columns: {
    id: 'teamSettingsNavigation.columns',
    defaultMessage: 'Columns',
    description: 'Label for the Columns settings navigation menu item',
  },
  data: {
    id: 'teamSettingsNavigation.data',
    defaultMessage: 'Data',
    description: 'Label for the Data settings navigation menu item',
  },
  integrations: {
    id: 'teamSettingsNavigation.integrations',
    defaultMessage: 'Integrations',
    description: 'Label for the Integrations settings navigation menu item',
  },
  languages: {
    id: 'teamSettingsNavigation.languages',
    defaultMessage: 'Languages',
    description: 'Label for the Languages settings navigation menu item',
  },
  members: {
    id: 'teamSettingsNavigation.members',
    defaultMessage: 'Members',
    description: 'Label for the Members settings navigation menu item',
  },
  newsletter: {
    id: 'teamSettingsNavigation.newsletter',
    defaultMessage: 'Newsletter',
    description: 'Label for the Newsletter settings navigation menu item',
  },
  reports: {
    id: 'teamSettingsNavigation.reports',
    defaultMessage: 'Reports',
    description: 'Label for the Reports settings navigation menu item',
  },
  rules: {
    id: 'teamSettingsNavigation.rules',
    defaultMessage: 'Rules',
    description: 'Label for the Rules settings navigation menu item',
  },
  settings: {
    id: 'teamSettingsNavigation.settings',
    defaultMessage: 'Settings',
    description: 'Header for the settings navigation menu items',
  },
  similarity: {
    id: 'teamSettingsNavigation.similarity',
    defaultMessage: 'Similarity',
    description: 'Label for the Similarity settings navigation menu item',
  },
  statuses: {
    id: 'teamSettingsNavigation.statuses',
    defaultMessage: 'Statuses',
    description: 'Label for the Statuses settings navigation menu item',
  },
  tags: {
    id: 'teamSettingsNavigation.tags',
    defaultMessage: 'Tags',
    description: 'Label for the Tags settings navigation menu item',
  },
  tipline: {
    id: 'teamSettingsNavigation.tipline',
    defaultMessage: 'Tipline',
    description: 'Label for the Tipline settings navigation menu item',
  },
  workspace: {
    id: 'teamSettingsNavigation.workspace',
    defaultMessage: 'Workspace',
    description: 'Label for the Workspace settings navigation menu item',
  },
});

const SettingsComponent = ({
  team,
  params,
  intl,
}) => {
  const { tab } = params;
  const userRole = UserUtil.myRole(window.Check.store.getState().app.context.currentUser, team.slug);
  const isAdmin = userRole === 'admin';
  const isAdminOrEditor = userRole === 'admin' || userRole === 'editor';
  const isAlegreBotInstalled = Boolean(team.alegre_bot);

  return (
    <React.Fragment>
      <div className={styles.listTitle}>
        {intl.formatMessage(messages.settings)}
      </div>
      <ul className={cx(styles.listWrapper, 'projects-list')}>
        <Link className={styles.linkList} to={`/${team.slug}/settings/workspace`} title={intl.formatMessage(messages.workspace)}>
          <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'workspace' })}>
            <div className={styles.listLabel}>
              {intl.formatMessage(messages.workspace)}
            </div>
          </li>
        </Link>
        { can(team.permissions, 'manage TeamTask') ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/annotation`} title={intl.formatMessage(messages.annotations)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'annotation' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.annotations)}
              </div>
            </li>
          </Link> : null
        }
        { isAdminOrEditor ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/columns`} title={intl.formatMessage(messages.columns)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'columns' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.columns)}
              </div>
            </li>
          </Link> : null
        }
        { isAdminOrEditor && Boolean(team.smooch_bot) ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/data`} title={intl.formatMessage(messages.data)}>
            <li className={cx(['team-settings__data-tab', styles.listItem], { [styles.listItem_active]: tab === 'data' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.data)}
              </div>
            </li>
          </Link> : null
        }
        { isAdmin ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/integrations`} title={intl.formatMessage(messages.integrations)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'integrations' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.integrations)}
              </div>
            </li>
          </Link> : null
        }
        { isAdmin ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/languages`} title={intl.formatMessage(messages.languages)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'languages' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.languages)}
              </div>
            </li>
          </Link> : null
        }
        <Link className={styles.linkList} to={`/${team.slug}/settings/members`} title={intl.formatMessage(messages.members)}>
          <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'members' })}>
            <div className={styles.listLabel}>
              {intl.formatMessage(messages.members)}
            </div>
          </li>
        </Link>
        { isAdminOrEditor ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/newsletter`} title={intl.formatMessage(messages.newsletter)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'newsletter' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.newsletter)}
              </div>
            </li>
          </Link> : null
        }
        { isAdminOrEditor && Boolean(team.smooch_bot) ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/report`} title={intl.formatMessage(messages.reports)}>
            <li className={cx(['team-settings__report-tab', styles.listItem], { [styles.listItem_active]: tab === 'report' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.reports)}
              </div>
            </li>
          </Link> : null
        }
        { isAdminOrEditor ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/rules`} title={intl.formatMessage(messages.rules)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'rules' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.rules)}
              </div>
            </li>
          </Link> : null
        }
        { isAdmin && isAlegreBotInstalled ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/similarity`} title={intl.formatMessage(messages.tags)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'similarity' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.similarity)}
              </div>
            </li>
          </Link> : null
        }
        { isAdminOrEditor ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/statuses`} title={intl.formatMessage(messages.statuses)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'statuses' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.statuses)}
              </div>
            </li>
          </Link> : null
        }
        { isAdminOrEditor ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/tags`} title={intl.formatMessage(messages.tags)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'tags' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.tags)}
              </div>
            </li>
          </Link> : null
        }
        { isAdminOrEditor ?
          <Link className={styles.linkList} to={`/${team.slug}/settings/tipline`} title={intl.formatMessage(messages.tipline)}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'tipline' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.tipline)}
              </div>
            </li>
          </Link> : null
        }
      </ul>
    </React.Fragment>
  );
};

SettingsComponent.propTypes = {
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    tab: PropTypes.string.isRequired,
  }).isRequired,
};

export { SettingsComponent }; // eslint-disable-line import/no-unused-modules

export default withSetFlashMessage(withRouter(injectIntl(SettingsComponent)));
