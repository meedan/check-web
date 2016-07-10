var React = require('react')
var UserProfileSlogan = React.createClass({
  render: function () {
    return(
    <div>{this.props.text}</div>
    )
  }
})

module.exports = UserProfileSlogan;
