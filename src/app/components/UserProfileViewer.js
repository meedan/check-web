var React = require('react')
var UserProfileBasicInfo = require('./UserProfileBasicInfo')
var AnnotationsListView = require('./AnnotationsListView')
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
