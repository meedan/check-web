import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { withRouter, Link } from 'react-router';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import { logout } from '../../redux/actions.js';
import { withSetFlashMessage } from '../FlashMessage.js';
import LogoutIcon from '../../icons/logout.svg';
import styles from './Projects/Projects.module.css';

const messages = defineMessages({
  userSettings: {
    id: 'userSettingsNavigation.usersettings',
    defaultMessage: 'User Settings',
    description: 'Navigation list title for user settings',
  },
  profile: {
    id: 'userSettingsNavigation.profile',
    defaultMessage: 'Profile',
    description: 'Label for the Profile user settings navigation menu item',
  },
  workspaces: {
    id: 'userSettingsNavigation.workspaces',
    defaultMessage: 'Workspaces',
    description: 'Label for the Workspaces user settings navigation menu item',
  },
  privacy: {
    id: 'userSettingsNavigation.privacy',
    defaultMessage: 'Privacy',
    description: 'Label for the privacy user settings navigation menu item',
  },
  security: {
    id: 'userSettingsNavigation.security',
    defaultMessage: 'Security',
    description: 'Label for the security user settings navigation menu item',
  },
});

const DrawerUserSettingsComponent = ({
  intl,
  me,
  params,
}) => {
  const { tab } = params;
  const isUserSelf = (me.id === window.Check.store.getState().app.context.currentUser.id);

  return (
    <React.Fragment>
      <div className={styles.listTitle}>
        {intl.formatMessage(messages.userSettings)}
      </div>
      <div className={styles.listWrapperScrollWrapper}>
        <ul className={styles.listWrapper}>
          { isUserSelf ?
            <>
              <Link className={cx('user-settings__profile-tab', styles.linkList)} title={intl.formatMessage(messages.profile)} to="/check/me/profile">
                <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'profile' })}>
                  <div className={styles.listLabel}>
                    {intl.formatMessage(messages.profile)}
                  </div>
                </li>
              </Link>
              <Link className={cx('user-settings__privacy-tab', styles.linkList)} title={intl.formatMessage(messages.privacy)} to="/check/me/privacy">
                <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'privacy' })}>
                  <div className={styles.listLabel}>
                    {intl.formatMessage(messages.privacy)}
                  </div>
                </li>
              </Link>
              <Link className={cx('user-settings__security-tab', styles.linkList)} title={intl.formatMessage(messages.security)} to="/check/me/security">
                <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'security' })}>
                  <div className={styles.listLabel}>
                    {intl.formatMessage(messages.security)}
                  </div>
                </li>
              </Link>
            </> : null
          }
          <Link className={cx('user-settings__workspaces-tab', styles.linkList)} title={intl.formatMessage(messages.workspaces)} to="/check/me/workspaces">
            <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'workspaces' })}>
              <div className={styles.listLabel}>
                {intl.formatMessage(messages.workspaces)}
              </div>
            </li>
          </Link>
        </ul>
      </div>
      <ul className={cx(styles.listWrapper, styles.listFooter)}>
        <li>
          <button
            className={cx('user-menu__logout', styles.listItem)}
            onClick={logout}
          >
            <LogoutIcon className={styles.listIcon} />
            <div className={styles.listLabel}>
              <FormattedMessage
                defaultMessage="Sign Out"
                description="This is the sign out button on the user profile page"
                id="UserMenu.signOut"
              />
            </div>
          </button>
        </li>
      </ul>
    </React.Fragment>
  );
};

DrawerUserSettingsComponent.propTypes = {
  params: PropTypes.shape({
    tab: PropTypes.string,
  }).isRequired,
};

const DrawerUserSettings = ({ intl, params }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query DrawerUserSettingsQuery {
        me {
          id
        }
      }
    `}
    render={({ error, props }) => {
      if (!props || error) return null;

      return <DrawerUserSettingsComponent intl={intl} me={props.me} params={params} />;
    }}
  />
);

export { DrawerUserSettings }; // eslint-disable-line import/no-unused-modules

export default withSetFlashMessage(withRouter(injectIntl(DrawerUserSettings)));
