var React = require('react')
var UserProfileViewsCounter = React.createClass({
  render: function () {
    return(
      <div> <button type="button">Views: {this.props.viewsCount}</button> </div>
    )
  }
})

module.exports = UserProfileViewsCounter;
