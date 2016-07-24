import React, { Component, PropTypes } from 'react';
import UserProfileBasicInfo from './UserProfileBasicInfo'
import AnnotationsListView from './AnnotationsListView'
import source from './Data_Source'

class UserProfileViewer extends Component {

  render () {
    return(

    <div>
      <UserProfileBasicInfo source={source}/>
      <AnnotationsListView annotations={source.annotations} />

    </div>

    )
  }
}
export default UserProfileViewer;
