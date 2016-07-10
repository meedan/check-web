var React = require('react')
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import Avatar from 'material-ui/Avatar';

const muiTheme = getMuiTheme({
  palette: {
  },
});
 var UserAvatar = React.createClass({

     render: function() {
         return (
           <MuiThemeProvider muiTheme={muiTheme}>
           <div>
           <Avatar
           size={100}
           src={this.props.url}
           style={{border: 12}} />           </div>
           </MuiThemeProvider>

         )
     }
})

module.exports = UserAvatar;
