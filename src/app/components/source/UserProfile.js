import React from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsHeader from '../team/SettingsHeader';
import UserEmail from '../user/UserEmail';
import UserInfoEdit from './UserInfoEdit';
import styles from './User.module.css';

const UserProfile = (props) => {
  const { user } = props;

  return (
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            id="userSettings.profileTitle"
            defaultMessage="Profile"
            description="Title for user settings area for user profile"
          />
        }
      />
      <div className={styles['user-setting-details-wrapper']}>
        <UserInfoEdit user={user} />
        <UserEmail user={user} />
      </div>
    </>
  );
};

export default UserProfile;
