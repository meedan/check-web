import React, { Component, PropTypes } from 'react';
import UserAvatar from './UserAvatar'
import UserProfileSlogan from './UserProfileSlogan'
import UserProfileStates from './UserProfileStates'
import UserProfileAccountsList from './UserProfileAccountsList'
import TextField from 'material-ui/lib/TextField';

class UserProfileBasicInfo extends Component {

  render () {
    return(
       <div>
        <UserAvatar url = 'http://pbs.twimg.com/profile_images/434022381770657792/RYsiZ7vR_normal.jpeg'/>
        <UserProfileSlogan text='Lorem ipsum dolor sit amet, feugiat ante purus dolore eget. Vehicula eget condimentum, eu sociosqu nunc pellentesque, elit in facilisis mauris, proin facilisis. Curabitur perferendis ipsum rutrum pede venenatis, sodales sodales lacinia sem eget facilisis curabitur'/>
        <UserProfileStates/>
        <UserProfileAccountsList/>
       </div>
      )
  }
})
export default UserProfileBasicInfo;
