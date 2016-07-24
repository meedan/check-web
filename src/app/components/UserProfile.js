import React, { Component, PropTypes } from 'react';

import UploadProfilePhoto from './UploadProfilePhoto'
import AddProfileName from './AddProfileName'
import AddProfileSlogan from './AddProfileSlogan'
import ProfileAccountsList from './ProfileAccountsList'
import SaveProfileButton from './SaveProfileButton'

class UserProfile extends Component {
  render () {
    return(

    <div>
      <UploadProfilePhoto/>
      <AddProfileName/>
      <AddProfileSlogan/>
      <ProfileAccountsList/>
      <SaveProfileButton/>
    </div>
    // <div>
    // <UploadProfilePhoto/>
    // <AddProfileName/>
    // <AddProfileSlogan/>
    // <ProfileAccountsList/>
    // </div>
    )
  }
}
export default UserProfile;
