var React = require('react')
var TwitterAccountIconButton = require('TwitterAccountIconButton')
var FacebookAccountIconButton = require('FacebookAccountIconButton')
var UserProfileAccountsList = React.createClass({
  render: function () {
    return(
    <div><TwitterAccountIconButton/><FacebookAccountIconButton/></div>
    )
  }
})

module.exports = UserProfileAccountsList;
