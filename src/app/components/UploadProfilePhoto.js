var React = require('react')
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';

const muiTheme = getMuiTheme({
  palette: {
  },
});
class UploadProfilePhoto extends Component {
   getInitialState(){
      return{
      };
    }

   _handleAvatarValueChange(e) {
     console.log('_handleAvatarValueChange');

       this.setState({
           avatarValue: 'https://www.fillmurray.com/300/300'
       });
   }
  render () {
    console.log('xx');

    return(
      <MuiThemeProvider muiTheme={muiTheme}>
      <div>
      <h3>Choose Avatar</h3>
        <Avatar
        size={100}
        src={this.state.avatarValue}
        style={{border: 12}} />
        <input type='file' onChange={this._handleAvatarValueChange}/>
      </div>
      </MuiThemeProvider>     )
  }
})
export default UploadProfilePhoto;
