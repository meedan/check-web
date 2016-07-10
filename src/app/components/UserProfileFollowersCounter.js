var React = require('react')
var UserProfileFollowersCounter = React.createClass({
  render: function () {
    return(
    <div> <button type="button">Followers: {this.props.followersCount}</button> </div>
    )
  }
})

module.exports = UserProfileFollowersCounter;
