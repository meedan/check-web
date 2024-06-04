import React from 'react';
import { withRouter, Link } from 'react-router';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import { logout } from '../../../redux/actions.js';
import { withSetFlashMessage } from '../../FlashMessage';
import LogoutIcon from '../../../icons/logout.svg';
import styles from './Projects.module.css';

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

const UserSettingsComponent = ({
  me,
  params,
  intl,
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
              <Link className={cx('user-settings__profile-tab', styles.linkList)} to="/check/me/profile" title={intl.formatMessage(messages.profile)}>
                <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'profile' })}>
                  <div className={styles.listLabel}>
                    {intl.formatMessage(messages.profile)}
                  </div>
                </li>
              </Link>
              <Link className={cx('user-settings__privacy-tab', styles.linkList)} to="/check/me/privacy" title={intl.formatMessage(messages.privacy)}>
                <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'privacy' })}>
                  <div className={styles.listLabel}>
                    {intl.formatMessage(messages.privacy)}
                  </div>
                </li>
              </Link>
              <Link className={cx('user-settings__security-tab', styles.linkList)} to="/check/me/security" title={intl.formatMessage(messages.security)}>
                <li className={cx([styles.listItem], { [styles.listItem_active]: tab === 'security' })}>
                  <div className={styles.listLabel}>
                    {intl.formatMessage(messages.security)}
                  </div>
                </li>
              </Link>
            </> : null
          }
          <Link className={cx('user-settings__workspaces-tab', styles.linkList)} to="/check/me/workspaces" title={intl.formatMessage(messages.workspaces)}>
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
                id="UserMenu.signOut"
                defaultMessage="Sign Out"
                description="This is the sign out button on the user profile page"
              />
            </div>
          </button>
        </li>
      </ul>
    </React.Fragment>
  );
};

UserSettingsComponent.propTypes = {
  params: PropTypes.shape({
    tab: PropTypes.string.isRequired,
  }).isRequired,
};

export { UserSettingsComponent }; // eslint-disable-line import/no-unused-modules

export default withSetFlashMessage(withRouter(injectIntl(UserSettingsComponent)));
