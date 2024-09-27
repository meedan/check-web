import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { withRouter, Link } from 'react-router';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import { can } from '../Can';
import UserUtil from '../user/UserUtil';
import { withSetFlashMessage } from '../FlashMessage';
import styles from './Projects/Projects.module.css';

const messages = defineMessages({
  annotations: {
    id: 'teamSettingsNavigation.annotations',
    defaultMessage: 'Annotations',
    description: 'Label for the Annotations settings navigation menu item',
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

const DrawerTeamSettingsComponent = ({
  intl,
  params,
  team,
}) => {
  const { tab } = params;
  const userRole = UserUtil.myRole(window.Check.store.getState().app.context.currentUser, team.slug);
  const isAdmin = userRole === 'admin';
  const isAdminOrEditor = userRole === 'admin' || userRole === 'editor';
  const isAlegreBotInstalled = Boolean(team.alegre_bot?.id);

  return (
    <React.Fragment>
      <div className={styles.listTitle}>
        {intl.formatMessage(messages.settings)}
      </div>
      <div className={styles.listWrapperScrollWrapper}>
        <ul className={styles.listWrapper}>
          <Link className={cx('team-settings__workspace-tab', styles.linkList)} title={intl.formatMessage(messages.workspace)} to={`/${team.slug}/settings/workspace`}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'workspace' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.workspace)}
              </div>
            </li>
          </Link>
          { can(team.permissions, 'manage TeamTask') ?
            <Link className={cx('team-settings__metadata-tab', styles.linkList)} title={intl.formatMessage(messages.annotations)} to={`/${team.slug}/settings/annotation`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'annotation' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.annotations)}
                </div>
              </li>
            </Link> : null
          }
          { isAdmin ?
            <Link className={cx('team-settings__integrations-tab', styles.linkList)} title={intl.formatMessage(messages.integrations)} to={`/${team.slug}/settings/integrations`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'integrations' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.integrations)}
                </div>
              </li>
            </Link> : null
          }
          { isAdmin ?
            <Link className={cx('team-settings__languages-tab', styles.linkList)} title={intl.formatMessage(messages.languages)} to={`/${team.slug}/settings/languages`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'languages' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.languages)}
                </div>
              </li>
            </Link> : null
          }
          <Link className={cx('team-settings__members-tab', styles.linkList)} title={intl.formatMessage(messages.members)} to={`/${team.slug}/settings/members`}>
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'members' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.members)}
              </div>
            </li>
          </Link>
          { isAdminOrEditor ?
            <Link className={cx('team-settings__newsletter-tab', styles.linkList)} title={intl.formatMessage(messages.newsletter)} to={`/${team.slug}/settings/newsletter`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'newsletter' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.newsletter)}
                </div>
              </li>
            </Link> : null
          }
          { isAdminOrEditor && Boolean(team.smooch_bot) ?
            <Link className={cx('team-settings__report-tab', styles.linkList)} title={intl.formatMessage(messages.reports)} to={`/${team.slug}/settings/report`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'report' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.reports)}
                </div>
              </li>
            </Link> : null
          }
          { isAdminOrEditor ?
            <Link className={cx('team-settings__rules-tab', styles.linkList)} title={intl.formatMessage(messages.rules)} to={`/${team.slug}/settings/rules`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'rules' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.rules)}
                </div>
              </li>
            </Link> : null
          }
          { isAdmin && isAlegreBotInstalled ?
            <Link className={cx('team-settings__similarity-tab', styles.linkList)} title={intl.formatMessage(messages.tags)} to={`/${team.slug}/settings/similarity`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'similarity' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.similarity)}
                </div>
              </li>
            </Link> : null
          }
          { isAdminOrEditor ?
            <Link className={cx('team-settings__statuses-tab', styles.linkList)} title={intl.formatMessage(messages.statuses)} to={`/${team.slug}/settings/statuses`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'statuses' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.statuses)}
                </div>
              </li>
            </Link> : null
          }
          { isAdminOrEditor ?
            <Link className={cx('team-settings__tags-tab', styles.linkList)} title={intl.formatMessage(messages.tags)} to={`/${team.slug}/settings/tags`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'tags' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.tags)}
                </div>
              </li>
            </Link> : null
          }
          { isAdminOrEditor ?
            <Link className={cx('team-settings__tipline-tab', styles.linkList)} title={intl.formatMessage(messages.tipline)} to={`/${team.slug}/settings/tipline`}>
              <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'tipline' })}>
                <div className={styles.listLabel}>
                  {intl.formatMessage(messages.tipline)}
                </div>
              </li>
            </Link> : null
          }
        </ul>
      </div>
    </React.Fragment>
  );
};

DrawerTeamSettingsComponent.propTypes = {
  params: PropTypes.shape({
    tab: PropTypes.string.isRequired,
  }).isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
};

const DrawerTeamSettings = ({ intl, params }) => {
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
      query DrawerTeamSettingsQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          slug
          permissions
          alegre_bot: team_bot_installation(bot_identifier: "alegre") {
            id
          }
          smooch_bot: team_bot_installation(bot_identifier: "smooch") {
            id
          }
        }
      }
    `}
      render={({ error, props }) => {
        if (!props || error) return null;

        return <DrawerTeamSettingsComponent intl={intl} params={params} team={props.team} />;
      }}
      variables={{ teamSlug }}
    />
  );
};

export { DrawerTeamSettingsComponent }; // eslint-disable-line import/no-unused-modules

export default withSetFlashMessage(withRouter(injectIntl(DrawerTeamSettings)));
