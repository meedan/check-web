var React = require('react')
var UploadProfilePhoto = require('UploadProfilePhoto')
var AddProfileName = require('AddProfileName')
var AddProfileSlogan = require('AddProfileSlogan')
var ProfileAccountsList = require('ProfileAccountsList')
var SaveProfileButton = require('SaveProfileButton')
var UserProfileBasicInfo = require ('UserProfileBasicInfo')
var UserProfileBasicInfo = require('UserProfileBasicInfo')
var UserProfileViewer = React.createClass({

  render: function () {
    return(

    <div>
    <UserProfileBasicInfo/>
    </div>

    )
  }
})

module.exports = UserProfileViewer;
