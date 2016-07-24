import React, { Component, PropTypes } from 'react';
import TwitterAccountIconButton from './TwitterAccountIconButton'
import FacebookAccountIconButton from './FacebookAccountIconButton'

class UserProfileAccountsList extends Component {
  render() {
    return(
    <div><TwitterAccountIconButton/><FacebookAccountIconButton/></div>
    )
  }
}
export default UserProfileAccountsList;
