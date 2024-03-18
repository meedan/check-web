import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import UserInfo from './UserInfo';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import styles from './user.module.css';

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
