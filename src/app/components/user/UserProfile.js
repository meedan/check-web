import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
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

UserProfile.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(UserProfile, {
  user: graphql`
    fragment UserProfile_user on Me {
      name
      ...UserInfoEdit_user
    }
  `,
});
