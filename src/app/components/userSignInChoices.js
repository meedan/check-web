var React = require('react')
var FacebookSigninButton = require('FacebookSigninButton')
var TwitterSigninButton = require('TwitterSigninButton')
var GoToSigninOrSignupWithEmailButton = require('GoToSigninOrSignupWithEmailButton')
var UserSignInChoices = React.createClass({
  render: function () {
    return(
      <div>
        <h1>Sign up / Sign in</h1>
        <FacebookSigninButton/>
        <TwitterSigninButton/>
        <GoToSigninOrSignupWithEmailButton/>
      </div>
    )
  }
})

module.exports = UserSignInChoices;
