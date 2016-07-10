var React = require('react')
var UserAvatar = require('./UserAvatar')
var UserProfileSlogan = require('./UserProfileSlogan')
var UserProfileStates = require ('./UserProfileStates')
var UserProfileAccountsList = require ('./UserProfileAccountsList')
import TextField from 'material-ui/lib/TextField';


 var UserProfileBasicInfo = React.createClass({
  render: function () {
    return(
       <div>
        <UserAvatar url = 'http://pbs.twimg.com/profile_images/434022381770657792/RYsiZ7vR_normal.jpeg'/>
        <UserProfileSlogan text='Lorem ipsum dolor sit amet, feugiat ante purus dolore eget. Vehicula eget condimentum, eu sociosqu nunc pellentesque, elit in facilisis mauris, proin facilisis. Curabitur perferendis ipsum rutrum pede venenatis, sodales sodales lacinia sem eget facilisis curabitur'/>
        <UserProfileStates/>
        <UserProfileAccountsList/>
       </div>
      )
  }
})

module.exports = UserProfileBasicInfo;
