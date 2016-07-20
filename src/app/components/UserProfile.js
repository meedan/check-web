var React = require('react')
var UploadProfilePhoto = require('UploadProfilePhoto')
var AddProfileName = require('AddProfileName')
var AddProfileSlogan = require('AddProfileSlogan')
var ProfileAccountsList = require('ProfileAccountsList')
var SaveProfileButton = require('SaveProfileButton')

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
})
export default UserProfile;
