import React, { useEffect } from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import UserProfile from './UserProfile';
import UserPrivacy from './UserPrivacy';
import UserSecurity from './UserSecurity';
import PageTitle from '../PageTitle';
import UserWorkspaces from '../user/UserWorkspaces';
import styles from '../team/Settings.module.css';

const MeComponent = ({ params, user }) => {
  const { tab } = params;

  // eslint-disable-next-line
  console.log('MeComponent', user, tab, params);

  useEffect(() => {
    if (!tab) {
      browserHistory.push('/check/me/profile');
    }
  }, [tab]);

  return (
    <PageTitle prefix={user.name}>
      <div className={cx('source', styles['settings-wrapper'])}>
        <div className={styles['settings-content']}>
          {tab === 'profile' && <UserProfile user={user} />}
          {(tab === 'teams' || tab === 'workspaces') && <UserWorkspaces user={user} />}
          {tab === 'privacy' && <UserPrivacy user={user} />}
          {tab === 'security' && <UserSecurity user={user} />}
        </div>
      </div>
    </PageTitle>
  );
};

MeComponent.propTypes = {
  params: PropTypes.shape({
    tab: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(MeComponent, {
  user: graphql`
    fragment MeComponent_user on Me {
      name
      ...UserProfile_user
      ...UserSecurity_user
      ...UserPrivacy_user
    }
  `,
});
