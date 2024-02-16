import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import UserEmail from '../user/UserEmail';
import UserInfo from './UserInfo';
import UserPrivacy from './UserPrivacy';
import UserSecurity from './UserSecurity';
import UserInfoEdit from './UserInfoEdit';
import { can } from '../Can';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import SwitchTeamsComponent from '../team/SwitchTeamsComponent';
import styles from './User.module.css';

class MeComponent extends React.Component {
  componentWillMount() {
    const user = this.props.me;
    if (!user.is_active) {
      browserHistory.push('/check/not-found');
    }
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  render() {
    const user = this.props.me;
    const isEditing = this.props.route.isEditing && can(user.permissions, 'update User');
    const context = this.getContext();
    let { tab } = this.props.params;

    if (!tab) {
      tab = 'workspaces';
      browserHistory.push(`/check/me/${tab}`);
    }

    return (
      <PageTitle prefix={user.name}>
        <div className={cx('source', styles['user-settings-wrapper'])}>
          <div className={styles['user-content']}>
            { isEditing ?
              <UserInfoEdit user={user} /> :
              <>
                <div className={styles['user-info-wrapper']}>
                  <UserEmail user={user} />
                </div>
                <UserInfo user={user} context={context} />
              </>
            }
            { isEditing ?
              null :
              <div className={styles['user-info-tabs-wrapper']}>
                <div className={styles['user-info-tabs-content']}>
                  { tab === 'teams' || tab === 'workspaces' ? <SwitchTeamsComponent user={user} /> : null}
                  { tab === 'privacy' ? <UserPrivacy user={user} /> : null}
                  { tab === 'security' ? <UserSecurity user={user} /> : null}
                </div>
              </div>
            }
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
