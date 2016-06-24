var React = require('react')

var FacebookSigninButton = React.createClass({
  render: function () {
    return(
      <a href="/api/users/auth/facebook?destination=/api" id="facebook-login">Facebook</a>
    )
  }
})

module.exports = FacebookSigninButton;
