import React from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsHeader from '../team/SettingsHeader';
import UserEmail from '../user/UserEmail';
import UserInfoEdit from './UserInfoEdit';

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
      <UserInfoEdit user={user} />
      <UserEmail user={user} />
    </>
  );
};

export default UserProfile;
