import React from 'react';
import UserInfoEdit from './UserInfoEdit';
import SettingsHeader from '../team/SettingsHeader';
import styles from '../team/Settings.module.css';

const UserProfile = (props) => {
  const { user } = props;

  return (
    <>
      <SettingsHeader
        title={user.name}
      />
      <div className={styles['setting-details-wrapper']}>
        <UserInfoEdit user={user} />
      </div>
    </>
  );
};

export default UserProfile;
