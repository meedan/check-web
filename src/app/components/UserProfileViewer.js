var React = require('react')
var UserProfileBasicInfo = require('./UserProfileBasicInfo')
var AnnotationsListView = require('./AnnotationsListView')

var UserProfileViewer = React.createClass({

  render: function () {
    return(

    <div>
      <UserProfileBasicInfo/>
      <AnnotationsListView annotations={["1","2","3"]} />

    </div>

    )
  }
})

module.exports = UserProfileViewer;
