import React from 'react';
import UserInfoEdit from './UserInfoEdit';
import SettingsHeader from '../team/SettingsHeader';
import styles from './user.module.css';

const UserProfile = (props) => {
  const { user } = props;

  return (
    <>
      <SettingsHeader
        title={user.name}
      />
      <div className={styles['user-setting-details-wrapper']}>
        <UserInfoEdit user={user} />
      </div>
    </>
  );
};

export default UserProfile;
