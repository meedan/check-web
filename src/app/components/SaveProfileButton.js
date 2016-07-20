var React = require('react')
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
const muiTheme = getMuiTheme({
  palette: {
  },
});

class SaveProfileButton extends Component {

     render {
         return (
           <MuiThemeProvider muiTheme={muiTheme}>
           <div>
              <RaisedButton
               label="Save"
               secondary={true}
               onTouchTap={this.handleTouchTap}
                />
           </div>
           </MuiThemeProvider>

         )
     }
})
export default SaveProfileButton;
