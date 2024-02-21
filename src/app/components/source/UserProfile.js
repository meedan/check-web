import React from 'react';
import UserEmail from '../user/UserEmail';
import UserInfoEdit from './UserInfoEdit';
import styles from './User.module.css';

const UserProfile = (props) => {
  const { user } = props;

  return (
    <>
      <UserInfoEdit user={user} />
      <div className={styles['user-info-wrapper']}>
        <UserEmail user={user} />
      </div>
    </>
  );
};

export default UserProfile;
