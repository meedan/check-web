var React = require('react')
var UserProfileBasicInfo = require('./UserProfileBasicInfo')
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
