var React = require('react')
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
const muiTheme = getMuiTheme({
  palette: {
  },
});
 var ProfileAccountsList = React.createClass({
  render: function () {
    return(
      <MuiThemeProvider muiTheme={muiTheme}>
      <div>
      <FlatButton
      label="Add Facebook account"
      secondary={true}
      onTouchTap={this.handleTouchTap}
       />
       <FlatButton
       label="Add Twitter account"
       secondary={true}
       onTouchTap={this.handleTouchTap}
        />
        <FlatButton
        label="Add Google account"
        secondary={true}
        onTouchTap={this.handleTouchTap}
         />

       </div>
      </MuiThemeProvider>       )
  }
})

module.exports = ProfileAccountsList;
