var React = require('react')
var UserProfileCommentsCounter = React.createClass({
  render: function () {
    return(
      <div> <button type="button">Comments: {this.props.commentsCount}</button> </div>
    )
  }
})

module.exports = UserProfileCommentsCounter;
