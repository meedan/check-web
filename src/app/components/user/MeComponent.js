import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import UserProfile from './UserProfile';
import UserPrivacy from './UserPrivacy';
import UserSecurity from './UserSecurity';
import PageTitle from '../PageTitle';
import UserWorkspaces from '../user/UserWorkspaces';
import styles from './user.module.css';

class MeComponent extends React.Component {
  UNSAFE_componentWillMount() {
    const { tab } = this.props.params;

    if (!tab) {
      browserHistory.push('/check/me/profile');
    }
  }

  render() {
    const user = this.props.me;
    const { tab } = this.props.params;

    return (
      <PageTitle prefix={user.name}>
        <div className={cx('source', styles['user-settings-wrapper'])}>
          <div className={styles['user-content']}>
            { tab === 'profile' ? <UserProfile user={user} /> : null}
            { tab === 'teams' || tab === 'workspaces' ? <UserWorkspaces user={user} /> : null}
            { tab === 'privacy' ? <UserPrivacy user={user} /> : null}
            { tab === 'security' ? <UserSecurity user={user} /> : null}
          </div>
        </div>
      </PageTitle>
    );
  }
}

MeComponent.contextTypes = {
  store: PropTypes.object,
};

export default MeComponent;
