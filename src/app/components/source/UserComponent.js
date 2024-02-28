import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import SettingsHeader from '../team/SettingsHeader';
import UserInfo from './UserInfo';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import styles from './User.module.css';

class UserComponent extends React.Component {
  componentWillMount() {
    const { user } = this.props;
    if (!user.is_active) {
      browserHistory.push('/check/not-found');
    }
    if (user.dbid === this.getContext().currentUser.dbid) {
      browserHistory.push('/check/me/profile');
    }
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  render() {
    const { user } = this.props;
    const context = this.getContext();

    return (
      <PageTitle prefix={user.name}>
        <div className={cx('source', styles['user-settings-wrapper'])}>
          <div className={styles['user-content']}>
            <SettingsHeader
              title={
                <FormattedMessage
                  id="userProfile.profileTitle"
                  defaultMessage="Profile"
                  description="Title for user profile page"
                />
              }
            />
            <div className={cx('source', styles['user-setting-details-wrapper'])}>
              <UserInfo user={user} context={context} />
            </div>
          </div>
        </div>
      </PageTitle>
    );
  }
}

UserComponent.contextTypes = {
  store: PropTypes.object,
};

export default UserComponent;
