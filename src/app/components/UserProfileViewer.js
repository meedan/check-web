import React, { Component, PropTypes } from 'react';
import UserProfileBasicInfo from './UserProfileBasicInfo'
import AnnotationsListView from './AnnotationsListView'

class UserProfileViewer extends Component {

  render () {
    return(

    <div>
      <UserProfileBasicInfo/>
      <AnnotationsListView annotations={["1","2","3"]} />

    </div>

    )
  }
})
export default UserProfileViewer;
