var React = require('react')
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';
const muiTheme = getMuiTheme({
  palette: {
  },
});
class AddProfileName extends Component {

   getInitialState {
         return {
             textFieldValue: ''
         };
     }

     _handleTextFieldChange {
         this.setState({
             textFieldValue: e.target.value
         });
     }

     render {
         return (
           <MuiThemeProvider muiTheme={muiTheme}>
           <div>
               <TextField floatingLabelText= "Name" value={this.state.textFieldValue} onChange={this._handleTextFieldChange} />
               <FlatButton
               label="Save"
               secondary={true}
               onTouchTap={this.handleTouchTap}
                />
           </div>
           </MuiThemeProvider>

         )
     }
})

export default AddProfileName;
