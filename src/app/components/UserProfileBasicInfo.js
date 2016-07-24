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
        <UserAvatar url = {this.props.source.image}/>
        <UserProfileSlogan text={this.props.source.slogan}/>
        <UserProfileAccountsList/>
       </div>
      )
  }
}
export default UserProfileBasicInfo;
