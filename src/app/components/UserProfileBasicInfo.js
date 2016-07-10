var React = require('react')
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
var UserProfileSlogan = require('UserProfileSlogan')
var UserAvatar = require('UserAvatar')
var UserProfileStates = require('UserProfileStates')
var UserProfileAccountsList = require('UserProfileAccountsList')
const muiTheme = getMuiTheme({
  palette: {
  },
});
 var UserProfileBasicInfo = React.createClass({
  render: function () {
    return(
      <MuiThemeProvider muiTheme={muiTheme}>
      <div>
      <UserAvatar url = 'http://pbs.twimg.com/profile_images/434022381770657792/RYsiZ7vR_normal.jpeg'/>
      <UserProfileSlogan text='Lorem ipsum dolor sit amet, feugiat ante purus dolore eget. Vehicula eget condimentum, eu sociosqu nunc pellentesque, elit in facilisis mauris, proin facilisis. Curabitur perferendis ipsum rutrum pede venenatis, sodales sodales lacinia sem eget facilisis curabitur'/>
      <UserProfileStates/>
      <UserProfileAccountsList/>
       </div>
      </MuiThemeProvider>       )
  }
})

module.exports = UserProfileBasicInfo;
