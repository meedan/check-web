var React = require('react')
var UploadProfilePhoto = require('UploadProfilePhoto')
var AddProfileName = require('AddProfileName')
var AddProfileSlogan = require('AddProfileSlogan')
var ProfileAccountsList = require('ProfileAccountsList')
var SaveProfileButton = require('SaveProfileButton')
var UserProfile = React.createClass({
  render: function () {
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

module.exports = UserProfile;
