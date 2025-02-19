import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import UserProfile from './UserProfile';
import UserPrivacy from './UserPrivacy';
import UserSecurity from './UserSecurity';
import PageTitle from '../PageTitle';
import UserWorkspaces from '../user/UserWorkspaces';
import styles from '../team/Settings.module.css';

const MeComponent = ({ me, params }) => {
  const { tab } = params;

  // eslint-disable-next-line
  console.log('MeComponent', me, tab, params);

  useEffect(() => {
    if (!tab) {
      browserHistory.push('/check/me/profile');
    }
  }, [tab]);

  return (
    <PageTitle prefix={me.name}>
      <div className={cx('source', styles['settings-wrapper'])}>
        <div className={styles['settings-content']}>
          {tab === 'profile' && <UserProfile user={me} />}
          {(tab === 'teams' || tab === 'workspaces') && <UserWorkspaces user={me} />}
          {tab === 'privacy' && <UserPrivacy user={me} />}
          {tab === 'security' && <UserSecurity user={me} />}
        </div>
      </div>
    </PageTitle>
  );
};

MeComponent.propTypes = {
  me: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    tab: PropTypes.string,
  }).isRequired,
};

export default MeComponent;
