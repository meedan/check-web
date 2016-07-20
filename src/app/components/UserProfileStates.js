import React, { Component, PropTypes } from 'react';
import UserProfileViewsCounter from './UserProfileViewsCounter'
import UserProfileFollowersCounter from './UserProfileFollowersCounter'
import UserProfileCommentsCounter from './UserProfileCommentsCounter'

class UserProfileStates extends Component {

  render () {
    return(
    <div>
      <UserProfileViewsCounter viewsCount='120'/>
      <UserProfileFollowersCounter followersCount='392'/>
      <UserProfileCommentsCounter commentsCount='8'/>
    </div>
    )
  }
})
export default UserProfileStates;
