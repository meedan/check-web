var React = require('react')
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
const muiTheme = getMuiTheme({
  palette: {
  },
});
 var TwitterAccountIconButton = React.createClass({
   handleTouchTap: function(e)
   {

   },
     render: function() {
         return (
           <MuiThemeProvider muiTheme={muiTheme}>
           <div>
              <RaisedButton
               label="Twitter"
               secondary={true}
               onTouchTap={this.handleTouchTap}
                />
           </div>
           </MuiThemeProvider>

         )
     }
})

module.exports = TwitterAccountIconButton;
