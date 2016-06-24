var React = require('react')

var TwitterSigninButton = React.createClass({
  render: function () {
    return(
      <a href="/api/users/auth/twitter?destination=/api" id="twitter-login">Twitter</a>
    )
  }
})

module.exports = TwitterSigninButton;
